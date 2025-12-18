import CompletedActivity from "../Models/CompletedActivity.js";
import User from "../Models/User.js";
import UserSubscription from "../Models/UserSubscription.js";

export const getFunnelData = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) {
        // Set to end of day for endDate
        const endOfDay = new Date(endDate);
        endOfDay.setHours(23, 59, 59, 999);
        dateFilter.createdAt.$lte = endOfDay;
      }
    }
    // If no date filter provided, dateFilter remains {} and queries return all-time data

    const totalUsers = await User.countDocuments({ 
      role: 'user',
      ...dateFilter
    });

    const usersStartedActivity = await CompletedActivity.distinct("userId", {
      userId: { $ne: null },
      ...dateFilter
    });

    const usersCompleted1 = await CompletedActivity.aggregate([
      { $match: { userId: { $ne: null }, ...dateFilter } },
      { $group: { _id: "$userId", totalCompleted: { $sum: 1 } } },
      { $match: { totalCompleted: { $eq: 1 } } },
      { $count: "count" }
    ]);
    const completed1Count = usersCompleted1[0]?.count || 0;

    const usersCompleted2 = await CompletedActivity.aggregate([
      { $match: { userId: { $ne: null }, ...dateFilter } },
      { $group: { _id: "$userId", totalCompleted: { $sum: 1 } } },
      { $match: { totalCompleted: { $eq: 2 } } },
      { $count: "count" }
    ]);
    const completed2Count = usersCompleted2[0]?.count || 0;

    const usersCompleted3Plus = await CompletedActivity.aggregate([
      { $match: { userId: { $ne: null }, ...dateFilter } },
      { $group: { _id: "$userId", totalCompleted: { $sum: 1 } } },
      { $match: { totalCompleted: { $gte: 3 } } },
      { $count: "count" }
    ]);
    const completed3PlusCount = usersCompleted3Plus[0]?.count || 0;

    const usersWithTrial = await UserSubscription.distinct("userId", {
      status: "trial",
      orderStatus: "paid",
      ...dateFilter
    });

    const usersWithPaidSubscription = await UserSubscription.distinct("userId", {
      status: "active",
      orderStatus: "paid",
      ...dateFilter
    });

    const step1 = totalUsers;
    const step2 = usersStartedActivity.length;
    const step3 = completed1Count;
    const step4 = completed2Count;
    const step5 = completed3PlusCount;
    const step6 = usersWithTrial.length;
    const step7 = usersWithPaidSubscription.length;

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
        description: "Completes 1 activity",
        count: step3,
        conversionRate: step2 ? ((step3 / step2) * 100).toFixed(1) + "%" : "0%"
      },
      {
        step: 4,
        description: "Completes 2 activities",
        count: step4,
        conversionRate: step3 ? ((step4 / step3) * 100).toFixed(1) + "%" : "0%"
      },
      {
        step: 5,
        description: "Completes 3+ activities",
        count: step5,
        conversionRate: step4 ? ((step5 / step4) * 100).toFixed(1) + "%" : "0%"
      },
      {
        step: 6,
        description: "Purchases trial period",
        count: step6,
        conversionRate: step5 ? ((step6 / step5) * 100).toFixed(1) + "%" : "0%"
      },
      {
        step: 7,
        description: "Converts to paid subscription",
        count: step7,
        conversionRate: step6 ? ((step7 / step6) * 100).toFixed(1) + "%" : "0%"
      }
    ];

    res.status(200).json({
      success: true,
      totalUsers,
      funnel,
      dateRange: {
        startDate: startDate || null,
        endDate: endDate || null
      }
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