import User from "../Models/User.js";
import CompletedActivity from "../Models/CompletedActivity.js";
import Activity from "../Models/Activity.js";
import mongoose from "mongoose";

/**
 * Get Retention Cohorts Analysis
 * Tracks how many users return week-over-week after signup
 */
export const getRetentionCohorts = async (req, res) => {
  try {
    const { 
      cohortType = 'weekly', // 'weekly' or 'monthly'
      startDate,
      endDate,
      segmentBy // 'ageGroup', 'device', 'learningDomain', etc.
    } = req.query;

    const start = startDate ? new Date(startDate) : new Date(Date.now() - 90 * 24 * 60 * 60 * 1000); // Default: last 90 days
    const end = endDate ? new Date(endDate) : new Date();

    // Get all users in the date range
    const users = await User.find({
      createdAt: { $gte: start, $lte: end },
      role: 'user'
    }).select('_id createdAt ageGroup');

    if (users.length === 0) {
      return res.status(200).json({
        success: true,
        cohorts: [],
        message: "No users found in the selected date range"
      });
    }

    // Group users into cohorts based on signup period
    const cohorts = groupIntoCohorts(users, cohortType);

    // Calculate retention for each cohort
    const retentionData = await Promise.all(
      cohorts.map(async (cohort) => {
        const retention = await calculateCohortRetention(
          cohort.users,
          cohort.startDate,
          cohortType
        );

        return {
          cohortName: cohort.name,
          cohortStartDate: cohort.startDate,
          cohortEndDate: cohort.endDate,
          totalUsers: cohort.users.length,
          retention
        };
      })
    );

    // If segmentation requested, also provide segmented data
    let segmentedData = null;
    if (segmentBy) {
      segmentedData = await getSegmentedRetention(
        users,
        cohortType,
        segmentBy
      );
    }

    res.status(200).json({
      success: true,
      cohortType,
      dateRange: { start, end },
      cohorts: retentionData,
      segmentedData,
      summary: calculateRetentionSummary(retentionData)
    });

  } catch (error) {
    console.error("Error in getRetentionCohorts:", error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to calculate retention cohorts" 
    });
  }
};

/**
 * Group users into cohorts (weekly or monthly)
 */
function groupIntoCohorts(users, cohortType) {
  const cohortMap = new Map();

  users.forEach(user => {
    const cohortKey = getCohortKey(user.createdAt, cohortType);
    
    if (!cohortMap.has(cohortKey)) {
      const { startDate, endDate, name } = getCohortDates(cohortKey, cohortType);
      cohortMap.set(cohortKey, {
        key: cohortKey,
        name,
        startDate,
        endDate,
        users: []
      });
    }
    
    cohortMap.get(cohortKey).users.push(user);
  });

  return Array.from(cohortMap.values()).sort((a, b) => 
    a.startDate - b.startDate
  );
}

/**
 * Get cohort key for grouping (e.g., "2025-W01" or "2025-01")
 */
function getCohortKey(date, cohortType) {
  const d = new Date(date);
  
  if (cohortType === 'monthly') {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  }
  
  // Weekly cohort
  const weekNumber = getWeekNumber(d);
  return `${d.getFullYear()}-W${String(weekNumber).padStart(2, '0')}`;
}

/**
 * Get week number of the year
 */
function getWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

/**
 * Get start and end dates for a cohort
 */
function getCohortDates(cohortKey, cohortType) {
  if (cohortType === 'monthly') {
    const [year, month] = cohortKey.split('-');
    const startDate = new Date(year, parseInt(month) - 1, 1);
    const endDate = new Date(year, parseInt(month), 0, 23, 59, 59);
    
    return {
      startDate,
      endDate,
      name: startDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
    };
  }
  
  // Weekly cohort
  const [year, week] = cohortKey.split('-W');
  const startDate = getDateOfISOWeek(parseInt(week), parseInt(year));
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 6);
  endDate.setHours(23, 59, 59);
  
  return {
    startDate,
    endDate,
    name: `Week ${week}, ${year}`
  };
}

/**
 * Get date of ISO week
 */
function getDateOfISOWeek(week, year) {
  const simple = new Date(year, 0, 1 + (week - 1) * 7);
  const dow = simple.getDay();
  const ISOweekStart = simple;
  if (dow <= 4) {
    ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
  } else {
    ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
  }
  return ISOweekStart;
}

/**
 * Calculate retention rates for a cohort
 */
async function calculateCohortRetention(users, cohortStartDate, cohortType) {
  const userIds = users.map(u => u._id);
  const periodDuration = cohortType === 'monthly' ? 30 : 7; // days
  const periodsToTrack = cohortType === 'monthly' ? 6 : 12; // 6 months or 12 weeks
  
  const retention = [];

  for (let period = 0; period <= periodsToTrack; period++) {
    const periodStart = new Date(cohortStartDate);
    periodStart.setDate(periodStart.getDate() + (period * periodDuration));
    
    const periodEnd = new Date(periodStart);
    periodEnd.setDate(periodEnd.getDate() + periodDuration - 1);
    periodEnd.setHours(23, 59, 59);

    // Don't calculate future periods
    if (periodStart > new Date()) break;

    // Count users who completed at least one activity in this period
    const activeUsers = await CompletedActivity.distinct('userId', {
      userId: { $in: userIds },
      completedAt: { $gte: periodStart, $lte: periodEnd }
    });

    const retentionRate = ((activeUsers.length / userIds.length) * 100).toFixed(1);

    retention.push({
      period: period === 0 ? 'Week 0 (Signup)' : `${cohortType === 'monthly' ? 'Month' : 'Week'} ${period}`,
      periodStart,
      periodEnd,
      activeUsers: activeUsers.length,
      retentionRate: parseFloat(retentionRate),
      droppedUsers: userIds.length - activeUsers.length
    });
  }

  return retention;
}

/**
 * Get segmented retention data
 */
async function getSegmentedRetention(users, cohortType, segmentBy) {
  const segments = new Map();

  // Group users by segment
  users.forEach(user => {
    const segmentValue = user[segmentBy] || 'Not Set';
    
    if (!segments.has(segmentValue)) {
      segments.set(segmentValue, []);
    }
    
    segments.get(segmentValue).push(user);
  });

  // Calculate retention for each segment
  const segmentedData = await Promise.all(
    Array.from(segments.entries()).map(async ([segmentValue, segmentUsers]) => {
      const cohorts = groupIntoCohorts(segmentUsers, cohortType);
      
      const retentionData = await Promise.all(
        cohorts.map(async (cohort) => {
          const retention = await calculateCohortRetention(
            cohort.users,
            cohort.startDate,
            cohortType
          );
          
          return {
            cohortName: cohort.name,
            totalUsers: cohort.users.length,
            retention
          };
        })
      );

      return {
        segment: segmentValue,
        totalUsers: segmentUsers.length,
        cohorts: retentionData
      };
    })
  );

  return segmentedData;
}

/**
 * Calculate summary statistics
 */
function calculateRetentionSummary(retentionData) {
  if (retentionData.length === 0) return null;

  // Average retention across all cohorts
  const avgRetentionByPeriod = [];
  const maxPeriods = Math.max(...retentionData.map(c => c.retention.length));

  for (let i = 0; i < maxPeriods; i++) {
    const periodsAtIndex = retentionData
      .map(c => c.retention[i])
      .filter(p => p !== undefined);

    if (periodsAtIndex.length > 0) {
      const avgRate = periodsAtIndex.reduce((sum, p) => sum + p.retentionRate, 0) / periodsAtIndex.length;
      
      avgRetentionByPeriod.push({
        period: periodsAtIndex[0].period,
        averageRetentionRate: parseFloat(avgRate.toFixed(1))
      });
    }
  }

  return {
    totalCohorts: retentionData.length,
    totalUsers: retentionData.reduce((sum, c) => sum + c.totalUsers, 0),
    avgRetentionByPeriod
  };
}

/**
 * Get User Engagement Metrics
 * Provides additional context for retention analysis
 */
export const getUserEngagementMetrics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();

    // Get all users in period
    const users = await User.find({
      createdAt: { $gte: start, $lte: end },
      role: 'user'
    });

    const userIds = users.map(u => u._id);

    // Calculate metrics
    const [
      totalActivitiesCompleted,
      activeUsers,
      activitiesByCategory,
      activitiesByAgeGroup
    ] = await Promise.all([
      // Total activities completed
      CompletedActivity.countDocuments({
        userId: { $in: userIds },
        completedAt: { $gte: start, $lte: end }
      }),

      // Active users (completed at least 1 activity)
      CompletedActivity.distinct('userId', {
        userId: { $in: userIds },
        completedAt: { $gte: start, $lte: end }
      }),

      // Activities by learning domain
      CompletedActivity.aggregate([
        {
          $match: {
            userId: { $in: userIds },
            completedAt: { $gte: start, $lte: end }
          }
        },
        {
          $lookup: {
            from: 'activities',
            localField: 'activityId',
            foreignField: '_id',
            as: 'activity'
          }
        },
        { $unwind: '$activity' },
        {
          $group: {
            _id: '$activity.learningDomain',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } }
      ]),

      // Activities by age group
      User.aggregate([
        {
          $match: {
            _id: { $in: userIds },
            ageGroup: { $exists: true, $ne: null }
          }
        },
        {
          $lookup: {
            from: 'completedactivities',
            let: { userId: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ['$userId', '$$userId'] },
                  completedAt: { $gte: start, $lte: end }
                }
              }
            ],
            as: 'completedActivities'
          }
        },
        {
          $group: {
            _id: '$ageGroup',
            users: { $sum: 1 },
            totalActivities: { $sum: { $size: '$completedActivities' } }
          }
        },
        { $sort: { totalActivities: -1 } }
      ])
    ]);

    const engagementRate = ((activeUsers.length / users.length) * 100).toFixed(1);
    const avgActivitiesPerUser = (totalActivitiesCompleted / users.length).toFixed(1);

    res.status(200).json({
      success: true,
      dateRange: { start, end },
      metrics: {
        totalUsers: users.length,
        activeUsers: activeUsers.length,
        engagementRate: parseFloat(engagementRate),
        totalActivitiesCompleted,
        avgActivitiesPerUser: parseFloat(avgActivitiesPerUser),
        activitiesByCategory: activitiesByCategory.map(cat => ({
          category: cat._id || 'Uncategorized',
          count: cat.count
        })),
        activitiesByAgeGroup: activitiesByAgeGroup.map(age => ({
          ageGroup: age._id,
          users: age.users,
          totalActivities: age.totalActivities,
          avgActivitiesPerUser: (age.totalActivities / age.users).toFixed(1)
        }))
      }
    });

  } catch (error) {
    console.error("Error in getUserEngagementMetrics:", error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to calculate engagement metrics" 
    });
  }
};

/**
 * Get Churn Analysis
 * Identifies users who haven't returned
 */
export const getChurnAnalysis = async (req, res) => {
  try {
    const { daysInactive = 14 } = req.query;
    
    const inactiveDate = new Date();
    inactiveDate.setDate(inactiveDate.getDate() - parseInt(daysInactive));

    // Find users who signed up but haven't completed activities recently
    const allUsers = await User.find({ role: 'user' });
    
    const churnedUsers = await Promise.all(
      allUsers.map(async (user) => {
        const lastActivity = await CompletedActivity.findOne({
          userId: user._id
        }).sort({ completedAt: -1 });

        const isChurned = !lastActivity || lastActivity.completedAt < inactiveDate;
        
        if (isChurned) {
          return {
            userId: user._id,
            email: user.email,
            username: user.username,
            signupDate: user.createdAt,
            lastActivityDate: lastActivity?.completedAt || null,
            daysInactive: lastActivity 
              ? Math.floor((new Date() - lastActivity.completedAt) / (1000 * 60 * 60 * 24))
              : Math.floor((new Date() - user.createdAt) / (1000 * 60 * 60 * 24)),
            ageGroup: user.ageGroup,
            totalActivitiesCompleted: await CompletedActivity.countDocuments({ userId: user._id })
          };
        }
        
        return null;
      })
    );

    const filteredChurned = churnedUsers.filter(u => u !== null);

    // Group by churn severity
    const churnSegments = {
      neverActive: filteredChurned.filter(u => u.totalActivitiesCompleted === 0),
      recentlyChurned: filteredChurned.filter(u => u.totalActivitiesCompleted > 0 && u.daysInactive <= 30),
      longTermChurned: filteredChurned.filter(u => u.totalActivitiesCompleted > 0 && u.daysInactive > 30)
    };

    res.status(200).json({
      success: true,
      daysInactive: parseInt(daysInactive),
      totalUsers: allUsers.length,
      totalChurned: filteredChurned.length,
      churnRate: ((filteredChurned.length / allUsers.length) * 100).toFixed(1),
      segments: {
        neverActive: {
          count: churnSegments.neverActive.length,
          users: churnSegments.neverActive
        },
        recentlyChurned: {
          count: churnSegments.recentlyChurned.length,
          users: churnSegments.recentlyChurned
        },
        longTermChurned: {
          count: churnSegments.longTermChurned.length,
          users: churnSegments.longTermChurned
        }
      }
    });

  } catch (error) {
    console.error("Error in getChurnAnalysis:", error);
    res.status(500).json({ 
      success: false, 
      error: "Failed to calculate churn analysis" 
    });
  }
};