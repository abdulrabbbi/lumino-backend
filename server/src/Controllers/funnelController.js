import CompletedActivity from "../Models/CompletedActivity.js";
import User from "../Models/User.js";
import UserSubscription from "../Models/UserSubscription.js";

export const getFunnelData = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const usersStartedActivity = await CompletedActivity.distinct("userId", {
      userId: { $ne: null }
    });

    const usersCompletedMultiple = await CompletedActivity.aggregate([
      { $match: { userId: { $ne: null } } },
      { $group: { _id: "$userId", totalCompleted: { $sum: 1 } } },
      { $match: { totalCompleted: { $gt: 1 } } },
      { $count: "count" }
    ]);
    const completedConsistentCount = usersCompletedMultiple[0]?.count || 0;

    const usersWithSubscription = await UserSubscription.distinct("userId", {
      status: { $in: ["active", "trial"] },
      orderStatus: { $in: ["paid"] }
    });

    const step1 = totalUsers;
    const step2 = usersStartedActivity.length;
    const step3 = completedConsistentCount;
    const step4 = usersWithSubscription.length;

    const funnel = [
      {
        step: 1,
        description: "Parent creates an account",
        count: step1,
        conversionRate: "100%"
      },
      {
        step: 2,
        description: "Starts first activity",
        count: step2,
        conversionRate: step1 ? ((step2 / step1) * 100).toFixed(1) + "%" : "0%"
      },
      {
        step: 3,
        description: "Completes multiple activities",
        count: step3,
        conversionRate: step2 ? ((step3 / step2) * 100).toFixed(1) + "%" : "0%"
      },
      {
        step: 4,
        description: "Purchases subscription",
        count: step4,
        conversionRate: step3 ? ((step4 / step3) * 100).toFixed(1) + "%" : "0%"
      }
    ];

    res.status(200).json({
      success: true,
      totalUsers,
      funnel
    });
  } catch (error) {
    console.error("Error fetching funnel data:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching funnel data",
      error: error.message
    });
  }
};
