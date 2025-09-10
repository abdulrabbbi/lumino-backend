
import CompletedActivity from '../Models/CompletedActivity.js';
import Activity from '../Models/Activity.js';
import RewardSetting from '../Models/RewardSetting.js';
import User from '../Models/User.js';


export const getTopContributors = async (req, res) => {
  try {
    const { month } = req.query;
    const yearMonth = month || new Date().toISOString().slice(0, 7); // Default to current month

    // Get reward pool for the month
    const rewardSetting = await RewardSetting.findOne({ month: yearMonth });
    const totalRewardPool = rewardSetting?.rewardPool || 2500;

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

    const activities = await Activity.find({ isApproved: true })
      .populate('userId', 'firstName surname');

    const qualifyingActivities = [];
    const creatorScores = {};

    for (const activity of activities) {
      const completions = activityCompletions[activity._id] || 0;
      const avgRating = activity.averageRating || 0;

      // Check qualification criteria
      if (completions >= 10 && avgRating >= 7.0) {
        const score = (completions * 0.6) + (avgRating * 0.4);
        
        qualifyingActivities.push({
          activityId: activity._id,
          activityName: activity.title,
          creatorId: activity.userId._id,
          creatorName: `${activity.userId.firstName} ${activity.userId.surname}`,
          executions: completions,
          averageRating: avgRating,
          score: parseFloat(score.toFixed(2))
        });

        // Aggregate scores per creator (max 3 activities)
        if (!creatorScores[activity.userId._id]) {
          creatorScores[activity.userId._id] = {
            creatorId: activity.userId._id,
            creatorName: `${activity.userId.firstName} ${activity.userId.surname}`,
            scores: [],
            totalScore: 0
          };
        }

        // Apply max 3 activities rule
        if (creatorScores[activity.userId._id].scores.length < 3) {
          creatorScores[activity.userId._id].scores.push(score);
          creatorScores[activity.userId._id].totalScore += score;
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
        estimatedEarnings: parseFloat(
          ((creator.totalScore / totalCombinedScore) * totalRewardPool).toFixed(2)
        )
      }))
      .sort((a, b) => b.totalScore - a.totalScore);

    const topActivities = qualifyingActivities
      .sort((a, b) => b.score - a.score)
      .slice(0, 50); // Limit to top 50 activities

    const summary = {
      totalRewardPool,
      qualifyingActivitiesCount: qualifyingActivities.length,
      totalCreatorsEarning: topCreators.length
    };

    res.status(200).json({
      success: true,
      data: {
        summary,
        topCreators,
        topActivities
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