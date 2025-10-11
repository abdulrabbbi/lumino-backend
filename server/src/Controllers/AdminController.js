import Activity from "../Models/Activity.js";
import Badge from "../Models/Badge.js";
import Subscription from "../Models/Subscription.js";
import User from "../Models/User.js";
import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken'
import UserSubscription from "../Models/UserSubscription.js";
import CompletedActivity from "../Models/CompletedActivity.js";
import GuestEmail from "../Models/GuestEmail.js";
import RewardSetting from "../Models/RewardSetting.js";
import TrackingEvents from "../Models/TrackingEvents.js";

export const adminLogin = async (req, res) => {
  try {
    const { email, password, adminSecretKey } = req.body;
    if (!email || !password || !adminSecretKey) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }
    if (adminSecretKey !== process.env.ADMIN_SECRET_KEY) {
      return res.status(403).json({ success: false, message: "Invalid admin secret key" });
    }

    const user = await User.findOne({ email });
    if (!user || user.role !== 'admin') {
      return res.status(401).json({ success: false, message: "Unauthorized access" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const payload = {
      userId: user._id,
      role: user.role,
      isTestFamily: user.isTestFamily,
      username: user.username
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        isTestFamily: user.isTestFamily
      }
    });

  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
export const changeTestUserPassword = async (req, res) => {
  try {
    const admin = await User.findById(req.user?.userId);
    if (!admin || admin.role !== "admin") {
      return res.status(403).json({ success: false, message: "Only admin can change passwords" });
    }

    const { userId, newPassword } = req.body;

    if (!userId || !newPassword) {
      return res.status(400).json({ success: false, message: "Email and new password are required" });
    }

    const user = await User.findOne({ email: userId }); // 🔁 Changed from findById to findOne({ email })

    if (!user || !user.isTestFamily) {
      return res.status(404).json({ success: false, message: "Test user not found" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ success: true, message: "Password updated successfully for test user" });
  } catch (error) {
    console.error("Error changing test user password:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
export const approveActivity = async (req, res) => {
  try {
    const admin = await User.findById(req.user?.userId);
    if (!admin || admin.role !== "admin") {
      return res
        .status(403)
        .json({ error: "Forbidden only admin can approved activity" });
    }

    const payload = {
      isApproved: true,
      status: "Actief",
    }

    const activity = await Activity.findByIdAndUpdate(
      req.params.id,
      payload,
      { new: true }
    );

    if (!activity) {
      return res.status(404).json({ error: "Activity not found" });
    }

    res.json({ success: true, message: "Activity approved by admin", activity });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
export const editParentsActivity = async (req, res) => {
  try {
    const admin = await User.findById(req.user?.userId);
    if (!admin || admin.role !== "admin") {
      return res
        .status(403)
        .json({ error: "Forbidden: only admin can edit activity" });
    }

    const updates = req.body; 
    const activity = await Activity.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    if (!activity) {
      return res.status(404).json({ error: "Activity not found" });
    }

    res.json({ success: true, message: "Activity updated successfully", activity });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
export const deleteParentsActivity = async (req, res) => {
  try {
    const admin = await User.findById(req.user?.userId);
    if (!admin || admin.role !== 'admin') {
      return res.status(403).json({ error: "Forbidden: only admin can delete activity" });
    }

    const activity = await Activity.findByIdAndDelete(req.params.id);

    if (!activity) {
      return res.status(404).json({ error: "Activity not found" });
    }

    res.json({ success: true, message: "Activity deleted successfully" });
  } catch (err) {
    res.status(500).json({  success: false, error: err.message });
  }
};
export const getParentApprovalActivity = async (req, res) => {
  try {
    const activities = await Activity.find({
      isApproved: false,
      status: "Concept",
    }).sort({ createdAt: -1 });

    res.status(200).json(activities);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server Error" });
  }
};
export const getAllActivities = async (req, res) => {
  try {
    const { filter } = req.query;
    
    let query = {};
    
    if (filter === 'Actief') {
      query.status = 'Actief';
    } else if (filter === 'Voltooid') {
      query.status = 'Voltooid';
    } else if (filter === 'Concept') {
      query.status = 'Concept';
    }
    
    const activities = await Activity.find(query)
      .sort({ createdAt: -1 });


      const activitiesWithCount = await Promise.all(
        activities.map(async (activity) => {
          const count = await CompletedActivity.countDocuments({ activityId: activity._id });
          return {
            ...activity.toObject(),
            completionCount: count, // add field
          };
        })
      );
    
    res.status(200).json({
      success: true,
      data: activitiesWithCount
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ 
      success: false,
      error: "Server Error" 
    });
  }
};
export const getActivityCounts = async (req, res) => {
  try {
    const allCount = await Activity.countDocuments();
    const activeCount = await Activity.countDocuments({ status: 'Actief' });
    const completedCount = await Activity.countDocuments({ status: 'Voltooid' });
    const draftCount = await Activity.countDocuments({ status: 'Concept' });

    res.status(200).json({
      all: allCount,
      active: activeCount,
      completed: completedCount,
      draft: draftCount
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ 
      success: false,
      error: "Server Error" 
    });
  }
};
const getDate30DaysAgo = () => {
  const date = new Date();
  date.setDate(date.getDate() - 30);
  return date;
};
export const getPlatformStats = async (req, res) => {
  try {
    const totalSubscribers = await User.countDocuments();
    const totalActivities = await Activity.countDocuments();
    const completedActivities = await Activity.countDocuments({ status: "Voltooid" });
    const completedActivitiesCount = await CompletedActivity.countDocuments({ userId: {$ne: null}});
    const newSubscribers = await User.countDocuments({ createdAt: { $gte: getDate30DaysAgo() } });
    let avgActivitiesPerUser = 0;
    if (totalSubscribers > 0) {
      avgActivitiesPerUser = totalActivities / totalSubscribers;
    }

    // Customer Lifetime Value (CLTV)
    // → get average price of all subscriptions (if you have purchase history, better to use that)
    const subscriptions = await Subscription.find({});
    let avgPrice = 0;
    if (subscriptions.length > 0) {
      const totalPrice = subscriptions.reduce((sum, sub) => sum + sub.price, 0);
      avgPrice = totalPrice / subscriptions.length;
    }

    return res.json({
      totalSubscribers,
      avgActivitiesPerUser: avgActivitiesPerUser.toFixed(2),
      completedActivities,
      newSubscribersLast30Days: newSubscribers,
      customerLifetimeValue: `€${avgPrice.toFixed(2)}`,
      TotalActvitiesCompleted: completedActivitiesCount,
    });

  } catch (error) {
    console.error("Error fetching platform stats:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
export const createActivity = async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const user = await User.findById(userId);
    if (!user || user.role !== 'admin') return res.status(404).json({ error: "Only admin has access" });

    let isApproved = false;
    let status = 'Concept';
    if (user.role === 'admin') {
      isApproved = true;
      status = 'Actief';
    }

    let creatorName = req.body.creatorName || req.user.username || "Floris";
    
    const activity = new Activity({
      ...req.body,
      createdBy: user._id,
      userId: user._id,
      creatorName,
      isApproved,
      status
    });

    await activity.save();

    res.status(201).json({
      success: true,
      message: "Your Activity is created",
      activity
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({ success: false, error: err.message });
  }
};
export const createBulkActivities = async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const user = await User.findById(userId);
    if (!user || user.role !== 'admin') return res.status(403).json({ error: "Only admin has access" });

    const { activities: bulkActivities, creatorName, learningDomain, ageGroup, time } = req.body;

    const defaultCreatorName = creatorName || "Floris";
    

    if (!bulkActivities || !Array.isArray(bulkActivities) || bulkActivities.length === 0) {
      return res.status(400).json({ error: "No activities provided" });
    }

    if (!creatorName || !learningDomain) {
      return res.status(400).json({ error: "Creator name and learning domain are required" });
    }

    const validActivities = bulkActivities.filter(activity => 
      activity.title && activity.description
    );

    if (validActivities.length === 0) {
      return res.status(400).json({ error: "No valid activities provided" });
    }

    const activitiesToCreate = validActivities.map(activity => ({
      ...activity,
      createdBy: user._id,
      userId: user._id,
      creatorName: defaultCreatorName,
      learningDomain,
      ageGroup: ageGroup || undefined,
      time: time || undefined,
      isApproved: true, 
      status: 'Actief',
      instructions: activity.instructions || [],
      materials: activity.materials || ''
    }));

    // Insert all activities at once
    const createdActivities = await Activity.insertMany(activitiesToCreate);

    res.status(201).json({
      success: true,
      message: `${createdActivities.length} activities created successfully`,
      activities: createdActivities
    });

  } catch (err) {
    console.error(err);
    res.status(400).json({ success: false, error: err.message });
  }
};
export const getAllBadges = async (req, res) => {
  try {
    const badges = await Badge.find().sort({ createdAt: -1 });
    res.status(200).json(badges);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
}
export const getAllUsersWithSubscription = async (req, res) => {
  try {
    const admin = await User.findById(req.user?.userId);
    if (!admin || admin.role !== 'admin') {
      return res.status(403).json({ success: false, message: "Only admin can access this." });
    }

    const users = await User.find().sort({ createdAt: -1 });

    const usersWithPlan = await Promise.all(users.map(async (user) => {
      let plan = 'No plan yet';

      if (user.isTestFamily) {
        plan = 'eeuwigsterk';
      } else {
        const userSub = await UserSubscription.findOne({ userId: user._id, status: 'active' }).populate('subscriptionId');
        if (userSub && userSub.subscriptionId) {
          plan = userSub.subscriptionId.name;
        }
      }

      return {
        id: user._id,
        username: user.username,
        email: user.email,
        isTestFamily: user.isTestFamily,
        subscriptionPlan: plan,
        createdAt: user.createdAt
      };
    }));

    res.status(200).json({
      success: true,
      users: usersWithPlan
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
export const getUserDetailsWithActivities = async (req, res) => {
  try {
    const admin = await User.findById(req.user?.userId);
    if (!admin || admin.role !== 'admin') {
      return res.status(403).json({ success: false, message: "Only admin can access this." });
    }

    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const completedActivities = await CompletedActivity.find({ userId: id }).populate('activityId');
    console.log(completedActivities);
    

    const formattedActivities = completedActivities.map(entry => ({
      id: entry.activityId?._id,
      title: entry.activityId?.title,
      learningDomain: entry.activityId?.learningDomain,
      completedAt: entry.completedAt
    })).filter(a => a.id); 

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        isTestFamily: user.isTestFamily
      },
      completedActivities: formattedActivities
    });
  } catch (error) {
    console.error("Error fetching user details:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
export const getTestFamilyUsers = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized access" });
    }
    const testFamilyUsers = await User.find({ isTestFamily: true })

    res.status(200).json({ success: true, users: testFamilyUsers });
  } catch (error) {
    console.error("Error fetching test family users:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
export const deleteUser = async (req, res) => {
  try {
    const {id} = req.params;

    if (!id) {
      return res.status(400).json({ success: false, message: "User ID is required" });
    }

    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.status(200).json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
export const getAllMarketingUsers = async (req,res) =>{
  try{

    const getAllUsers = await GuestEmail.find()
    return res.status(200).json({getAllUsers})
  }
  catch(error){
    console.log(error);
    return res.status(500).json({error: 'Internal Server Error'})
    
  }
}

// Rewards System APIS
export const setRewardPool = async (req, res) => {
  try {
    const { month, rewardPool } = req.body; // "2025-09", 3000

    const setting = await RewardSetting.findOneAndUpdate(
      { month },
      { rewardPool },
      { new: true, upsert: true }
    );

    res.json({ success: true, setting });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
export const getRewardPool = async (req, res) => {
  try {
    const { month } = req.query;
    const setting = await RewardSetting.findOne({ month });

    res.json({ success: true, rewardPool: setting?.rewardPool });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Tracking Events Apis
export const getAllEvents = async (req, res) => {
  try {
    const events = await TrackingEvents.find()
      .populate("userId", "username email") 
      .sort({ createdAt: -1 });

    res.json({ success: true, events });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
