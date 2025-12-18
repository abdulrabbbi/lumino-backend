
import CompletedActivity from '../Models/CompletedActivity.js';
import Activity from '../Models/Activity.js';
import RewardSetting from '../Models/RewardSetting.js';
import User from '../Models/User.js';

export const getTopContributors = async (req, res) => {
  try {
    const { month } = req.query;
    const yearMonth = month || new Date().toISOString().slice(0, 7);

    // Get reward pool for the month
    const rewardSetting = await RewardSetting.findOne({ month: yearMonth });
    const totalRewardPool = rewardSetting?.rewardPool;
    const rewardPoolText = rewardSetting ? `€${totalRewardPool}` : 'Pool price not set';

    // Get start and end dates for the month
    const startDate = new Date(`${yearMonth}-01`);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);

    const completedActivities = await CompletedActivity.find({
      completedAt: { $gte: startDate, $lt: endDate }
    });

    const activityCompletions = {};
    completedActivities.forEach(ca => {
      activityCompletions[ca.activityId] = (activityCompletions[ca.activityId] || 0) + 1;
    });

    // Get only parent activities (non-admin users) with proper population
    const parentActivities = await Activity.find({ 
      isApproved: true
    }).populate({
      path: 'userId',
      select: 'firstName surname email role',
      match: { role: { $ne: 'admin' } } // Only include users with role not equal to 'admin'
    });

    const qualifyingActivities = [];
    const creatorScores = {};

    for (const activity of parentActivities) {
      // Skip activities where user is admin or user data is not properly populated
      if (!activity.userId || activity.userId.role === 'admin') {
        continue;
      }

      const completions = activityCompletions[activity._id] || 0;
      const avgRating = activity.averageRating || 0;

      // Check qualification criteria
      if (completions >= 4 && avgRating >= 7.0) {
        const score = (completions * 0.6) + (avgRating * 0.4);
        
        // Use creatorName from activity document instead of populated user
        const creatorName = activity.creatorName || 
                           (activity.userId ? `${activity.userId.firstName || ''} ${activity.userId.surname || ''}`.trim() : 'Unknown Creator');
        
        qualifyingActivities.push({
          activityId: activity._id,
          activityName: activity.title,
          creatorId: activity.userId._id,
          creatorName: creatorName,
          executions: completions,
          averageRating: avgRating,
          score: parseFloat(score.toFixed(2))
        });

        const creatorId = activity.userId._id.toString();
        
        if (!creatorScores[creatorId]) {
          creatorScores[creatorId] = {
            creatorId: creatorId,
            creatorName: creatorName,
            scores: [],
            totalScore: 0
          };
        }

        // Apply max 3 activities rule
        if (creatorScores[creatorId].scores.length < 3) {
          creatorScores[creatorId].scores.push(score);
          creatorScores[creatorId].totalScore += score;
        }
      }
    }

    // Calculate total combined score
    const totalCombinedScore = Object.values(creatorScores).reduce(
      (sum, creator) => sum + creator.totalScore, 0
    );

    const topCreators = Object.values(creatorScores)
      .map(creator => ({
        creatorId: creator.creatorId,
        creatorName: creator.creatorName,
        qualifyingActivitiesCount: creator.scores.length,
        totalScore: parseFloat(creator.totalScore.toFixed(2)),
        estimatedEarnings: totalRewardPool && totalCombinedScore > 0 
          ? parseFloat(((creator.totalScore / totalCombinedScore) * totalRewardPool).toFixed(2))
          : rewardPoolText
      }))
      .sort((a, b) => b.totalScore - a.totalScore);

    const summary = {
      totalRewardPool: rewardPoolText,
      qualifyingActivitiesCount: qualifyingActivities.length,
      totalCreatorsEarning: topCreators.length
    };

    res.status(200).json({
      success: true,
      data: {
        summary,
        topCreators,
        qualifyingActivities
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

export const getTopActivitiesLeaderboard = async (req, res) => {
  try {
    const { month, limit = 50 } = req.query;
    const yearMonth = month || new Date().toISOString().slice(0, 7);

    // Get start and end dates for the month
    const startDate = new Date(`${yearMonth}-01`);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);

    const completedActivities = await CompletedActivity.find({
      completedAt: { $gte: startDate, $lt: endDate }
    });

    const activityCompletions = {};
    completedActivities.forEach(ca => {
      activityCompletions[ca.activityId] = (activityCompletions[ca.activityId] || 0) + 1;
    });

    // Get all approved activities (both parent and system)
    const activities = await Activity.find({ isApproved: true })
      .populate({
        path: 'userId',
        select: 'firstName surname email role'
      });

    const leaderboardActivities = [];

    for (const activity of activities) {
      const completions = activityCompletions[activity._id] || 0;
      const avgRating = activity.averageRating || 0;

      // Only include activities that meet the minimum criteria
      if (completions >= 4 && avgRating >= 7.0) {
        const score = (completions * 0.6) + (avgRating * 0.4);
        
        // Use creatorName from activity document
        const creatorName = activity.creatorName || 
                           (activity.userId ? `${activity.userId.firstName || ''} ${activity.userId.surname || ''}`.trim() : 'Unknown Creator');
        
        // Determine creator type
        const creatorType = activity.userId?.role === 'admin' ? 'system' : 'parent';

        leaderboardActivities.push({
          activityId: activity._id,
          activityName: activity.title,
          creatorId: activity.userId?._id || activity.createdBy,
          creatorName: creatorName,
          creatorType: creatorType,
          executions: completions,
          averageRating: avgRating,
          score: parseFloat(score.toFixed(2)),
          isSystemActivity: creatorType === 'system'
        });
      }
    }

    // Sort by score and limit results
    const topActivities = leaderboardActivities
      .sort((a, b) => b.score - a.score)
      .slice(0, parseInt(limit));

    res.status(200).json({
      success: true,
      data: {
        topActivities,
        totalActivities: leaderboardActivities.length
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};