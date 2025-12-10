import User from "../Models/User.js";
import CompletedActivity from "../Models/CompletedActivity.js";
import {
  calculateRetentionSummary, groupIntoCohorts,
  getCohortKey,
  getCohortDates,
} from "../Utils/cohortfuntions.js";


//  Get Retention Cohorts Analysis
//  Tracks how many users return week-over-week after signup
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

//  Calculate retention rates for a cohort
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


// Get segmented retention data
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

//  Get User Engagement Metrics
//  Provides additional context for retention analysis
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


//  Get Churn Analysis
//  Identifies users who haven't returned
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