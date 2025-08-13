import Activity from "../Models/Activity.js";
import CompletedActivity from "../Models/CompletedActivity.js";
import { v4 as uuidv4 } from 'uuid';
import User from "../Models/User.js";
import WeekPlaySet from "../Models/WeekPlaySet.js";
import Badge from "../Models/Badge.js";
import { parseWeekKey, areConsecutiveWeeks, getTop5Activities, getWeekOfYear, isMoreThanAWeekOld, isPastMondayRefresh, getCurrentMondayAt6AM, getNextMondayAt6AM } from "../Helper/ActivityHelper.js";
import mongoose from "mongoose";

export const createActivity = async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    let isApproved = false;
    let status = 'Concept';
    if (user.role === 'admin') {
      isApproved = true;
      status = 'Actief';
    }

    let creatorName = req.user.username;

    const activity = new Activity({
      ...req.body,
      createdBy: user._id,
      userId: user._id,
      creatorName,
      isApproved,
      status
    });

    await activity.save();

    // 🏅 Check if this is the user's first activity
    const userActivitiesCount = await Activity.countDocuments({ userId: user._id });
    const alreadyHasIdeaBadge = user.badges.includes("Idea Contributor");
    let awardedBadge = null;

    if (userActivitiesCount === 1 && !alreadyHasIdeaBadge) {
      const ideaBadge = await Badge.findOne({ name: "Idea Contributor" });

      if (ideaBadge) {
        user.badges.push("Idea Contributor");
        await user.save();

        awardedBadge = {
          _id: ideaBadge._id,
          name: ideaBadge.name,
          description: ideaBadge.description,
          icon: ideaBadge.icon,
          category: ideaBadge.category,
        };
      }
    }

    res.status(201).json({
      success: true,
      message: isApproved
        ? "Activity created and auto-approved by admin."
        : "Congratulations, your activity is created and under review.",
      activity,
      badge: awardedBadge
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({ success: false, error: err.message });
  }
};

export const getAllActivities = async (req, res) => {
  try {
    const activities = await Activity.find().sort({ createdAt: -1 });
    res.status(200).json(activities);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server Error" });
  }
};
export const rateActivity = async (req, res) => {
  try {
    const userId = req.user?.userId || null;
    const { id } = req.params;
    const { value } = req.body;

    if (!value || value < 1 || value > 10) {
      return res.status(400).json({ error: "Rating must be between 1 and 10." });
    }

    const activity = await Activity.findById(id);
    if (!activity) return res.status(404).json({ error: "Activity not found." });

    let identifier;
    if (userId) {
      identifier = { user: userId };
    } else {
      // For guests, use session ID or IP
      const guestId = req.session.guestId || req.ip;
      if (!guestId) {
        return res.status(400).json({ error: "Guest identifier not found." });
      }
      identifier = { guestId };
    }

    // Check for existing rating
    const existingIndex = activity.ratings.findIndex(r =>
      (r.user && r.user.toString() === userId) ||
      (r.guestId && r.guestId === identifier.guestId)
    );

    if (existingIndex >= 0) {
      // Update existing rating
      activity.ratings[existingIndex].value = value;
    } else {
      // Add new rating
      activity.ratings.push({
        ...identifier,
        value
      });
    }

    // Calculate new average
    const total = activity.ratings.reduce((sum, r) => sum + r.value, 0);
    activity.averageRating = (total / activity.ratings.length).toFixed(1);

    await activity.save();

    res.json({
      success: true,
      averageRating: activity.averageRating,
      message: "Rating submitted successfully"
    });

  } catch (err) {
    console.error(err);
    res.status(400).json({ success: false, error: err.message });
  }
};
export const getActivityLibrary = async (req, res) => {
  try {
    const userId = req.user?.userId;

    let isTestFamily = false;
    let isLoggedIn = false;

    if (userId) {
      const user = await User.findById(userId);
      if (user) {
        isLoggedIn = true;
        isTestFamily = user.isTestFamily;
        console.log(`User ${user.username} isTestFamily: ${isTestFamily}`);
      }
    }

    let activities = await Activity.find({
      isApproved: true
    }).sort({ createdAt: -1 });

    // If user is logged in, fetch completed activity IDs
    let completedActivityIds = [];
    if (userId) {
      const completedActivities = await CompletedActivity.find({ userId }).select("activityId");
      completedActivityIds = completedActivities.map(a => a.activityId.toString());
    }

    // Map activities with isLocked and isCompleted flags
    const enrichedActivities = activities.map(activity => {
      const isCompleted = completedActivityIds.includes(activity._id.toString());

      let isLocked = true;
      if (isLoggedIn && isTestFamily) {
        isLocked = false;
      } else if (isCompleted) {
        isLocked = false;
      }

      return {
        ...activity.toObject(),
        isLocked,
        isCompleted
      };
    });

    // Sort so incomplete activities come first
    enrichedActivities.sort((a, b) => {
      if (a.isCompleted === b.isCompleted) return 0;
      return a.isCompleted ? 1 : -1; // completed go after
    });

    res.status(200).json({ success: true, activities: enrichedActivities });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server Error" });
  }
};
export const getSingleActivity = async (req, res) => {
  try {
    const { id } = req.params;

    // Default values
    let userId = null;
    let userType = "guest";
    let guestId = req.session?.guestId || req.ip;

    // If user is logged in
    if (req.user?.userId) {
      userId = req.user.userId;
      userType = "user";
    }

    // Get activity
    const activity = await Activity.findById(id).populate("createdBy", "username");

    if (!activity) {
      return res.status(404).json({ success: false, error: "Activity not found." });
    }

    // Check if the activity is completed
    let isCompleted = false;

    if (userType === "user" && userId) {
      const completion = await CompletedActivity.findOne({
        activityId: id,
        userId,
        userType: "user",
      });
      isCompleted = !!completion;
    } else if (userType === "guest" && guestId) {
      const completion = await CompletedActivity.findOne({
        activityId: id,
        guestId,
        userType: "guest",
      });
      isCompleted = !!completion;
    }

    // Send response
    return res.status(200).json({
      success: true,
      activity: {
        ...activity.toObject(),
        isCompleted,
      },
    });
  } catch (error) {
    console.error("Error fetching single activity:", error);
    return res.status(500).json({ success: false, error: "Server error while fetching activity." });
  }
};
export const filterActivities = async (req, res) => {
  try {
    const { searchTerm, category, age, sort } = req.query
    const query = {}

    // Keyword search
    if (searchTerm && typeof searchTerm === "string") {
      query.title = { $regex: searchTerm, $options: "i" }
    }

    // Category filter: Corrected to use 'learningDomain' from the schema
    if (category && category !== "Alle Leergebieden") {
      query.learningDomain = category
    }

    // Age filter: Corrected to match ageGroup string with spaces
    if (age && age !== "alle-leeftijden") {
      const formattedAge = age.replace("-", " - ")
      query.ageGroup = formattedAge
    }

    const userId = req.user?.userId
    let isTestFamily = false
    let isLoggedIn = false
    let completedActivityIds = new Set() // To store IDs of activities completed by the user

    if (userId) {
      const user = await User.findById(userId)
      if (user) {
        isLoggedIn = true
        isTestFamily = user.isTestFamily
        // Fetch all completed activities for the logged-in user
        const completedActivities = await CompletedActivity.find({ userId }).select("activityId")
        completedActivityIds = new Set(completedActivities.map((c) => c.activityId.toString()))
      }
    }

    // --- Handle 'voltooid' filter (strict filtering) ---
    if (sort === "voltooid") {
      if (!isLoggedIn) {
        // If a guest user tries to sort by 'voltooid', return an empty array
        return res.status(200).json({
          success: true,
          activities: [],
          message: "Login required to view completed activities.",
        })
      }
      // If logged in, add a filter to the query to only include completed activities
      query._id = { $in: Array.from(completedActivityIds).map((id) => new mongoose.Types.ObjectId(id)) }
    }

    // Fetch activities based on the constructed query
    const activities = await Activity.find(query).exec()

    // Add isLocked and isCompleted flags to all activities before sending
    const finalActivities = activities.map((activity) => {
      const activityObject = activity.toObject()
      let isLocked = true
      if (isLoggedIn && isTestFamily) {
        isLocked = false
      }
      // Check if the current activity's ID is in the set of completed activities for the user
      const isCompleted = completedActivityIds.has(activityObject._id.toString())

      return { ...activityObject, isLocked, isCompleted }
    })

    // --- Apply sorting logic ---
    if (sort === "hoogstgewaardeerde") {
      finalActivities.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0))
    } else if (sort === "meestgewaardeerde") {
      // Assuming 'likes' is a field in your Activity model for 'meestgewaardeerde'
      finalActivities.sort((a, b) => (b.likes || 0) - (a.likes || 0))
    }

    // Default sorting: uncompleted activities first, then completed activities
    // This applies if 'sort' is not 'voltooid' (which is handled as a strict filter above)
    // and also as a primary sort for 'hoogstgewaardeerde'/'meestgewaardeerde'
    if (sort !== "voltooid") {
      finalActivities.sort((a, b) => {
        // If 'a' is completed and 'b' is not, 'b' comes first (-1)
        if (a.isCompleted && !b.isCompleted) return 1
        // If 'a' is not completed and 'b' is, 'a' comes first (1)
        if (!a.isCompleted && b.isCompleted) return -1
        // If both have the same completion status, maintain existing order or apply secondary sort
        return 0 // Keep original order if completion status is same, secondary sorts already applied
      })
    }

    res.status(200).json({ success: true, activities: finalActivities })
  } catch (error) {
    console.error("Error filtering activities:", error)
    res.status(500).json({ message: "Server error" })
  }
}


const checkAndAwardAreaBadges = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) return [];

    const areaBadgeMapping = {
      'emotionele gezondheid': {
        name: 'Feelings Finder',
        description: '3 of meer emotionele gezondheid-activiteiten voltooid met je kind.',
        requiredCount: 3
      },
      'dankbaarheid': {
        name: 'Gratitude Giver (Area)',
        description: '3 of meer dankbaarheidsactiviteiten voltooid met je kind.',
        requiredCount: 3
      },
      'zelfzorg': {
        name: 'Self Care Star',
        description: '3 of meer zelfzorgactiviteiten voltooid met je kind.',
        requiredCount: 3
      },
      'geldwijsheid': {
        name: 'Money Minded',
        description: '3 of meer financiële activiteiten voltooid met je kind.',
        requiredCount: 3
      },
      'ondernemerschap': {
        name: 'Mini Maker',
        description: '3 of meer ondernemerschapsactiviteiten voltooid met je kind.',
        requiredCount: 3
      },
      'anders denken': {
        name: 'Creative Thinker',
        description: '3 of meer creatieve activiteiten voltooid met je kind om verbeeldingskracht te stimuleren.',
        requiredCount: 3
      }
    };

    const completedActivities = await CompletedActivity.find({ userId })
      .populate({
        path: 'activityId',
        match: { isApproved: true },
        select: 'learningDomain'
      });

    const validCompletedActivities = completedActivities.filter(comp => comp.activityId);

    const domainCounts = {};
    validCompletedActivities.forEach(completion => {
      const domain = completion.activityId.learningDomain?.toLowerCase()?.trim();
      if (domain) {
        domainCounts[domain] = (domainCounts[domain] || 0) + 1;
      }
    });

    const newlyEarnedBadges = [];

    for (const [domain, badgeInfo] of Object.entries(areaBadgeMapping)) {
      const completedCount = domainCounts[domain] || 0;
      const alreadyHasBadge = user.badges.includes(badgeInfo.name);

      if (completedCount >= badgeInfo.requiredCount && !alreadyHasBadge) {
        const badgeFromDB = await Badge.findOne({ name: badgeInfo.name });

        if (badgeFromDB) {
          user.badges.push(badgeInfo.name);

          newlyEarnedBadges.push({
            _id: badgeFromDB._id,
            name: badgeFromDB.name,
            description: badgeFromDB.description,
            icon: badgeFromDB.icon,
            category: badgeFromDB.category,
          });
        }
      }
    }

    if (newlyEarnedBadges.length > 0) {
      await user.save();
    }

    return newlyEarnedBadges;

  } catch (error) {
    console.error('Error checking area badges:', error);
    return [];
  }
};
const checkAndAwardCategoriesMaster = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) return [];

    const badgeName = 'Categories Master';
    const alreadyHasBadge = user.badges.includes(badgeName);

    if (alreadyHasBadge) return [];

    // Get all approved activities grouped by learning domain
    const allActivities = await Activity.find({
      isApproved: true,
      learningDomain: { $ne: null, $ne: '' }
    });

    // Group activities by domain
    const domainGroups = {};
    allActivities.forEach(activity => {
      const domain = activity.learningDomain?.toLowerCase()?.trim();
      if (domain) {
        if (!domainGroups[domain]) {
          domainGroups[domain] = [];
        }
        domainGroups[domain].push(activity._id);
      }
    });

    const completedActivities = await CompletedActivity.find({ userId })
      .populate({
        path: 'activityId',
        match: { isApproved: true },
        select: 'learningDomain'
      });

    const completedActivityIds = completedActivities
      .filter(comp => comp.activityId)
      .map(comp => comp.activityId._id.toString());

    // Check if user has completed all activities in at least one domain
    let hasCompletedFullCategory = false;
    for (const [domain, activityIds] of Object.entries(domainGroups)) {
      const allActivitiesInDomainCompleted = activityIds.every(activityId =>
        completedActivityIds.includes(activityId.toString())
      );

      if (allActivitiesInDomainCompleted && activityIds.length > 0) {
        hasCompletedFullCategory = true;
        break;
      }
    }

    if (hasCompletedFullCategory) {
      const badgeFromDB = await Badge.findOne({ name: badgeName });

      if (badgeFromDB) {
        user.badges.push(badgeName);
        await user.save();

        return [{
          _id: badgeFromDB._id,
          name: badgeFromDB.name,
          description: badgeFromDB.description,
          icon: badgeFromDB.icon,
          category: badgeFromDB.category,
        }];
      }
    }

    return [];

  } catch (error) {
    console.error('Error checking Categories Master badge:', error);
    return [];
  }
};
const checkAndAwardMasterParent = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) return [];

    const badgeName = 'Master Parent';
    const alreadyHasBadge = user.badges.includes(badgeName);

    if (alreadyHasBadge) return [];

    const totalActivities = await Activity.countDocuments({ isApproved: true });

    const completedCount = await CompletedActivity.countDocuments({
      userId,
      activityId: { $in: await Activity.find({ isApproved: true }).distinct('_id') }
    });

    if (completedCount >= totalActivities && totalActivities > 0) {
      const badgeFromDB = await Badge.findOne({ name: badgeName });

      if (badgeFromDB) {
        user.badges.push(badgeName);
        await user.save();

        return [{
          _id: badgeFromDB._id,
          name: badgeFromDB.name,
          description: badgeFromDB.description,
          icon: badgeFromDB.icon,
          category: badgeFromDB.category,
        }];
      }
    }

    return [];

  } catch (error) {
    console.error('Error checking Master Parent badge:', error);
    return [];
  }
};
const checkAndAwardStreakBuilder = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) return [];

    const badgeName = 'Streak Builder';
    const alreadyHasBadge = user.badges.includes(badgeName);

    if (alreadyHasBadge) return [];

    const completedActivities = await CompletedActivity.find({ userId })
      .sort({ completedAt: 1 });

    if (completedActivities.length === 0) return [];

    const weeklyActivity = {};
    completedActivities.forEach(activity => {
      const date = new Date(activity.completedAt);
      const year = date.getFullYear();
      const week = getWeekOfYear(date);
      const weekKey = `${year}-W${week}`;

      if (!weeklyActivity[weekKey]) {
        weeklyActivity[weekKey] = 0;
      }
      weeklyActivity[weekKey]++;
    });

    // Check for 3 consecutive weeks with at least 1 activity each
    const weeks = Object.keys(weeklyActivity).sort();
    let consecutiveWeeks = 0;
    let maxConsecutiveWeeks = 0;

    for (let i = 0; i < weeks.length; i++) {
      if (weeklyActivity[weeks[i]] >= 1) {
        consecutiveWeeks++;

        // Check if next week exists and is consecutive
        if (i < weeks.length - 1) {
          const currentWeek = parseWeekKey(weeks[i]);
          const nextWeek = parseWeekKey(weeks[i + 1]);

          if (!areConsecutiveWeeks(currentWeek, nextWeek)) {
            maxConsecutiveWeeks = Math.max(maxConsecutiveWeeks, consecutiveWeeks);
            consecutiveWeeks = 0;
          }
        } else {
          maxConsecutiveWeeks = Math.max(maxConsecutiveWeeks, consecutiveWeeks);
        }
      } else {
        maxConsecutiveWeeks = Math.max(maxConsecutiveWeeks, consecutiveWeeks);
        consecutiveWeeks = 0;
      }
    }

    if (maxConsecutiveWeeks >= 3) {
      const badgeFromDB = await Badge.findOne({ name: badgeName });

      if (badgeFromDB) {
        user.badges.push(badgeName);
        await user.save();

        return [{
          _id: badgeFromDB._id,
          name: badgeFromDB.name,
          description: badgeFromDB.description,
          icon: badgeFromDB.icon,
          category: badgeFromDB.category,
        }];
      }
    }

    return [];

  } catch (error) {
    console.error('Error checking Streak Builder badge:', error);
    return [];
  }
};
const checkAndAwardChampion = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) return [];

    const badgeName = 'Champion';
    const alreadyHasBadge = user.badges.includes(badgeName);

    if (alreadyHasBadge) return [];

    const completedActivities = await CompletedActivity.find({ userId })
      .sort({ completedAt: 1 });

    if (completedActivities.length === 0) return [];

    const weeklyActivity = {};
    completedActivities.forEach(activity => {
      const date = new Date(activity.completedAt);
      const year = date.getFullYear();
      const week = getWeekOfYear(date);
      const weekKey = `${year}-W${week}`;

      if (!weeklyActivity[weekKey]) {
        weeklyActivity[weekKey] = 0;
      }
      weeklyActivity[weekKey]++;
    });

    // Check for 12 consecutive weeks with at least 1 activity each
    const weeks = Object.keys(weeklyActivity).sort();
    let consecutiveWeeks = 0;
    let maxConsecutiveWeeks = 0;

    for (let i = 0; i < weeks.length; i++) {
      if (weeklyActivity[weeks[i]] >= 1) {
        consecutiveWeeks++;

        // Check if next week exists and is consecutive
        if (i < weeks.length - 1) {
          const currentWeek = parseWeekKey(weeks[i]);
          const nextWeek = parseWeekKey(weeks[i + 1]);

          if (!areConsecutiveWeeks(currentWeek, nextWeek)) {
            maxConsecutiveWeeks = Math.max(maxConsecutiveWeeks, consecutiveWeeks);
            consecutiveWeeks = 0;
          }
        } else {
          maxConsecutiveWeeks = Math.max(maxConsecutiveWeeks, consecutiveWeeks);
        }
      } else {
        maxConsecutiveWeeks = Math.max(maxConsecutiveWeeks, consecutiveWeeks);
        consecutiveWeeks = 0;
      }
    }

    if (maxConsecutiveWeeks >= 12) {
      const badgeFromDB = await Badge.findOne({ name: badgeName });

      if (badgeFromDB) {
        user.badges.push(badgeName);
        await user.save();

        return [{
          _id: badgeFromDB._id,
          name: badgeFromDB.name,
          description: badgeFromDB.description,
          icon: badgeFromDB.icon,
          category: badgeFromDB.category,
        }];
      }
    }

    return [];

  } catch (error) {
    console.error('Error checking Champion badge:', error);
    return [];
  }
};
const checkAndAwardSurprisePlayer = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) return [];

    const badgeName = 'Surprise Player';
    const alreadyHasBadge = user.badges.includes(badgeName);

    if (alreadyHasBadge) return [];

    const surpriseBadgeNames = [
      'First Step',
      'Feelings Finder',
      'Gratitude Giver (Area)',
      'Self Care Star',
      'Money Minded',
      'Mini Maker',
      'Creative Thinker'
      // Add more badge names that you consider as surprise/hidden badges
    ];

    const userSurpriseBadges = user.badges.filter(badgeName =>
      surpriseBadgeNames.includes(badgeName)
    );

    if (userSurpriseBadges.length >= 3) {
      const badgeFromDB = await Badge.findOne({ name: badgeName });

      if (badgeFromDB) {
        user.badges.push(badgeName);
        await user.save();

        return [{
          _id: badgeFromDB._id,
          name: badgeFromDB.name,
          description: badgeFromDB.description,
          icon: badgeFromDB.icon,
          category: badgeFromDB.category,
        }];
      }
    }

    return [];

  } catch (error) {
    console.error('Error checking Surprise Player badge:', error);
    return [];
  }
};

const checkAndAwardFiveInARow = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) return [];

    const badgeName = '5-In-A-Row';
    const alreadyHasBadge = user.badges.includes(badgeName);

    if (alreadyHasBadge) return [];

    const completedActivities = await CompletedActivity.find({ userId })
      .sort({ completedAt: 1 });

    if (completedActivities.length === 0) return [];

    const weeklyActivity = {};
    completedActivities.forEach(activity => {
      const date = new Date(activity.completedAt);
      const year = date.getFullYear();
      const week = getWeekOfYear(date);
      const weekKey = `${year}-W${week}`;

      if (!weeklyActivity[weekKey]) {
        weeklyActivity[weekKey] = 0;
      }
      weeklyActivity[weekKey]++;
    });

    // Check if any week has 5 or more completed activities
    const hasWeekWith5Activities = Object.values(weeklyActivity).some(count => count >= 5);

    if (hasWeekWith5Activities) {
      const badgeFromDB = await Badge.findOne({ name: badgeName });

      if (badgeFromDB) {
        user.badges.push(badgeName);
        await user.save();

        return [{
          _id: badgeFromDB._id,
          name: badgeFromDB.name,
          description: badgeFromDB.description,
          icon: badgeFromDB.icon,
          category: badgeFromDB.category,
        }];
      }
    }

    return [];

  } catch (error) {
    console.error('Error checking 5-In-A-Row badge:', error);
    return [];
  }
};

const checkAndAwardConsistencyChamp = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) return [];

    const badgeName = 'Consistency Champ';
    const alreadyHasBadge = user.badges.includes(badgeName);

    if (alreadyHasBadge) return [];

    const completedActivities = await CompletedActivity.find({ userId })
      .sort({ completedAt: 1 });

    if (completedActivities.length === 0) return [];

    const weeklyActivity = {};
    completedActivities.forEach(activity => {
      const date = new Date(activity.completedAt);
      const year = date.getFullYear();
      const week = getWeekOfYear(date);
      const weekKey = `${year}-W${week}`;

      if (!weeklyActivity[weekKey]) {
        weeklyActivity[weekKey] = 0;
      }
      weeklyActivity[weekKey]++;
    });

    // Check for 4 consecutive weeks with at least 1 activity each
    const weeks = Object.keys(weeklyActivity).sort();
    let consecutiveWeeks = 0;
    let maxConsecutiveWeeks = 0;

    for (let i = 0; i < weeks.length; i++) {
      if (weeklyActivity[weeks[i]] >= 1) {
        consecutiveWeeks++;

        // Check if next week exists and is consecutive
        if (i < weeks.length - 1) {
          const currentWeek = parseWeekKey(weeks[i]);
          const nextWeek = parseWeekKey(weeks[i + 1]);

          if (!areConsecutiveWeeks(currentWeek, nextWeek)) {
            maxConsecutiveWeeks = Math.max(maxConsecutiveWeeks, consecutiveWeeks);
            consecutiveWeeks = 0;
          }
        } else {
          maxConsecutiveWeeks = Math.max(maxConsecutiveWeeks, consecutiveWeeks);
        }
      } else {
        maxConsecutiveWeeks = Math.max(maxConsecutiveWeeks, consecutiveWeeks);
        consecutiveWeeks = 0;
      }
    }

    if (maxConsecutiveWeeks >= 4) {
      const badgeFromDB = await Badge.findOne({ name: badgeName });

      if (badgeFromDB) {
        user.badges.push(badgeName);
        await user.save();

        return [{
          _id: badgeFromDB._id,
          name: badgeFromDB.name,
          description: badgeFromDB.description,
          icon: badgeFromDB.icon,
          category: badgeFromDB.category,
        }];
      }
    }

    return [];

  } catch (error) {
    console.error('Error checking Consistency Champ badge:', error);
    return [];
  }
};

const checkAndAwardBounceBack = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) return [];

    const badgeName = 'Bounce Back';
    const alreadyHasBadge = user.badges.includes(badgeName);

    if (alreadyHasBadge) return [];

    // Get completed activities in the resilience (veerkracht) domain
    const completedActivities = await CompletedActivity.find({ userId })
      .populate({
        path: 'activityId',
        match: {
          isApproved: true,
          learningDomain: { $regex: /veerkracht/i } // Case-insensitive match for resilience
        },
        select: 'learningDomain'
      });

    // Filter for resilience activities (veerkracht)
    const resilienceCompletions = completedActivities.filter(comp =>
      comp.activityId &&
      comp.activityId.learningDomain &&
      comp.activityId.learningDomain.toLowerCase().includes('veerkracht')
    );

    if (resilienceCompletions.length >= 3) {
      const badgeFromDB = await Badge.findOne({ name: badgeName });

      if (badgeFromDB) {
        user.badges.push(badgeName);
        await user.save();

        return [{
          _id: badgeFromDB._id,
          name: badgeFromDB.name,
          description: badgeFromDB.description,
          icon: badgeFromDB.icon,
          category: badgeFromDB.category,
        }];
      }
    }

    return [];

  } catch (error) {
    console.error('Error checking Bounce Back badge:', error);
    return [];
  }
};

const checkAndAwardGratitudeGiver = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) return [];

    const badgeName = 'Gratitude Giver';
    const alreadyHasBadge = user.badges.includes(badgeName);

    if (alreadyHasBadge) return [];

    // Get completed activities in the gratitude (dankbaarheid) domain
    const completedActivities = await CompletedActivity.find({ userId })
      .populate({
        path: 'activityId',
        match: {
          isApproved: true,
          learningDomain: { $regex: /dankbaarheid/i } // Case-insensitive match for gratitude
        },
        select: 'learningDomain'
      });

    // Filter for gratitude activities (dankbaarheid)
    const gratitudeCompletions = completedActivities.filter(comp =>
      comp.activityId &&
      comp.activityId.learningDomain &&
      comp.activityId.learningDomain.toLowerCase().includes('dankbaarheid')
    );

    if (gratitudeCompletions.length >= 3) {
      const badgeFromDB = await Badge.findOne({ name: badgeName });

      if (badgeFromDB) {
        user.badges.push(badgeName);
        await user.save();

        return [{
          _id: badgeFromDB._id,
          name: badgeFromDB.name,
          description: badgeFromDB.description,
          icon: badgeFromDB.icon,
          category: badgeFromDB.category,
        }];
      }
    }

    return [];

  } catch (error) {
    console.error('Error checking Gratitude Giver badge:', error);
    return [];
  }
};

const checkAndAwardFocusFinisher = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) return [];

    const badgeName = 'Focus Finisher';
    const alreadyHasBadge = user.badges.includes(badgeName);

    if (alreadyHasBadge) return [];

    // Get completed activities in the focus domain
    const completedActivities = await CompletedActivity.find({ userId })
      .populate({
        path: 'activityId',
        match: {
          isApproved: true,
          learningDomain: { $regex: /focus|concentratie|aandacht/i } // Case-insensitive match for focus-related terms
        },
        select: 'learningDomain'
      });

    // Filter for focus activities
    const focusCompletions = completedActivities.filter(comp =>
      comp.activityId &&
      comp.activityId.learningDomain &&
      (comp.activityId.learningDomain.toLowerCase().includes('focus') ||
        comp.activityId.learningDomain.toLowerCase().includes('concentratie') ||
        comp.activityId.learningDomain.toLowerCase().includes('aandacht'))
    );

    if (focusCompletions.length >= 3) {
      const badgeFromDB = await Badge.findOne({ name: badgeName });

      if (badgeFromDB) {
        user.badges.push(badgeName);
        await user.save();

        return [{
          _id: badgeFromDB._id,
          name: badgeFromDB.name,
          description: badgeFromDB.description,
          icon: badgeFromDB.icon,
          category: badgeFromDB.category,
        }];
      }
    }

    return [];

  } catch (error) {
    console.error('Error checking Focus Finisher badge:', error);
    return [];
  }
};
export const markActivityCompleted = async (req, res) => {
  try {
    const { id } = req.params;
    let userId = null;
    let userType = "guest";
    let guestId = null;

    if (req.user && req.user.userId) {
      userId = req.user.userId;
      userType = "user";
    } else {
      if (req.session) {
        guestId = req.session.guestId;
        if (!guestId) {
          req.session.guestId = uuidv4();
          guestId = req.session.guestId;
        }
      }
      if (!guestId) {
        guestId = req.ip;
      }
    }

    // Check if already completed
    const existing = await CompletedActivity.findOne({
      activityId: id,
      ...(userId ? { userId } : { guestId }),
    });

    if (existing) {
      return res.status(200).json({
        success: true,
        message: "Activity already marked as completed",
      });
    }

    // Mark as completed
    const completion = new CompletedActivity({
      activityId: id,
      ...(userId ? { userId } : { guestId }),
      userType,
      completedAt: new Date(),
    });

    await completion.save();
    await Activity.findByIdAndUpdate(id, { status: "Voltooid" });

    // Update session for guests
    if (!userId) {
      const completedInCurrentWeek = req.session?.completedActivitiesInWeek || [];
      if (!completedInCurrentWeek.includes(id)) {
        completedInCurrentWeek.push(id);
        req.session.completedActivitiesInWeek = completedInCurrentWeek;
      }

      const allTimeCompleted = req.session?.allTimeCompleted || [];
      if (!allTimeCompleted.includes(id)) {
        allTimeCompleted.push(id);
        req.session.allTimeCompleted = allTimeCompleted;
      }
    }

    // Badge checking for registered users
    let earnedBadges = [];
    if (userId) {
      const user = await User.findById(userId);
      if (user) {
        const totalCompleted = await CompletedActivity.countDocuments({ userId });
        
        // First Step badge
        if (totalCompleted === 1 && !user.badges.includes("First Step")) {
          const firstStepBadge = await Badge.findOne({ name: "First Step" });
          if (firstStepBadge) {
            user.badges.push("First Step");
            await user.save();
            earnedBadges.push({
              _id: firstStepBadge._id,
              name: firstStepBadge.name,
              description: firstStepBadge.description,
              icon: firstStepBadge.icon,
              category: firstStepBadge.category,
            });
          }
        }

        // Check all other badges
        const areaBadges = await checkAndAwardAreaBadges(userId);
        const categoriesMasterBadges = await checkAndAwardCategoriesMaster(userId);
        const masterParentBadges = await checkAndAwardMasterParent(userId);
        const streakBuilderBadges = await checkAndAwardStreakBuilder(userId);
        const championBadges = await checkAndAwardChampion(userId);
        const surprisePlayerBadges = await checkAndAwardSurprisePlayer(userId);
        const mobileExplorerBadges = await checkAndAwardMobileExplorer(userId, req);
        const surpriseStreakBadges = await checkAndAwardSurpriseStreak(userId);
        const fiveInARowBadges = await checkAndAwardFiveInARow(userId);
        const consistencyChampBadges = await checkAndAwardConsistencyChamp(userId);
        const bounceBackBadges = await checkAndAwardBounceBack(userId);
        const gratitudeGiverBadges = await checkAndAwardGratitudeGiver(userId);
        const focusFinisherBadges = await checkAndAwardFocusFinisher(userId);

        earnedBadges = [
          ...earnedBadges,
          ...areaBadges,
          ...categoriesMasterBadges,
          ...masterParentBadges,
          ...streakBuilderBadges,
          ...championBadges,
          ...surprisePlayerBadges,
          ...mobileExplorerBadges,
          ...surpriseStreakBadges,
          ...fiveInARowBadges,
          ...consistencyChampBadges,
          ...bounceBackBadges,
          ...gratitudeGiverBadges,
          ...focusFinisherBadges
        ];
      }
    }

    // Check week completion status
    let weekCompletionInfo = null;
    if (userId) {
      const currentWeekSet = await WeekPlaySet.findOne({ userId }).sort({ weekNumber: -1 });
      if (currentWeekSet) {
        const currentWeekCompleted = await CompletedActivity.find({
          userId,
          activityId: { $in: currentWeekSet.activities },
          completedAt: { $gte: currentWeekSet.generatedAt }
        });

        const completedCount = currentWeekCompleted.length;
        const isWeekCompleted = completedCount >= 5;

        if (isWeekCompleted) {
          const weekStartDate = new Date(currentWeekSet.generatedAt);
          const currentDate = new Date();
          const daysElapsed = Math.floor((currentDate - weekStartDate) / (1000 * 60 * 60 * 24));
          const daysRemaining = Math.max(0, 7 - daysElapsed);

          weekCompletionInfo = {
            weekNumber: currentWeekSet.weekNumber,
            isCompleted: true,
            completedActivities: completedCount,
            message: `🎉 Week ${currentWeekSet.weekNumber} completed! ${daysRemaining > 0 ? `Week ${currentWeekSet.weekNumber + 1} unlocks in ${daysRemaining} days` : `Week ${currentWeekSet.weekNumber + 1} available now!`}`
          };
        }
      }
    } else {
      // Guest week completion check
      const completedInCurrentWeek = req.session?.completedActivitiesInWeek || [];
      if (completedInCurrentWeek.length >= 5) {
        const currentWeekNumber = req.session?.weekNumber || 1;
        weekCompletionInfo = {
          weekNumber: currentWeekNumber,
          isCompleted: true,
          completedActivities: completedInCurrentWeek.length,
          message: `🎉 Week ${currentWeekNumber} completed! Week ${currentWeekNumber + 1} will unlock after 7 days!`
        };
      }
    }

    res.status(200).json({
      success: true,
      message: "Activity marked as completed successfully",
      badge: earnedBadges.length > 0 ? earnedBadges[0] : null,
      badges: earnedBadges,
      weekCompletion: weekCompletionInfo
    });

  } catch (err) {
    console.error('Error in markActivityCompleted:', err);
    res.status(400).json({ success: false, error: err.message });
  }
};
export const checkActivityStatus = async (req, res) => {
  const { activityId } = req.params;
  const userId = req.user?._id || null;
  const userType = req.user ? "user" : "guest";

  try {
    const existingRecord = await CompletedActivity.findOne({
      activityId,
      userId,
      userType,
    });

    res.status(200).json({
      success: true,
      completed: !!existingRecord,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getProgressStats = async (req, res) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(200).json({
        success: true,
        stats: {
          completedActivities: 0,
          badges: 0,
          weekPercentage: 0,
          addedActivities: 0,
        },
        categories: [],
        isGuest: true,
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    const validCompleted = await CompletedActivity.find({ userId }).populate({
      path: 'activityId',
      match: { isApproved: true, learningDomain: { $ne: null } }, // ignore bad entries
    });

    const completedCount = validCompleted.filter(c => c.activityId).length;

    const addedActivitiesCount = await Activity.countDocuments({
      createdBy: userId,
      isApproved: true,
    });

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const weeklyCompleted = await CompletedActivity.countDocuments({
      userId,
      completedAt: { $gte: oneWeekAgo },
    });

    const weekPercentage = Math.min(Math.round((weeklyCompleted / 5) * 100), 100);

    const allActivities = await Activity.find({ isApproved: true });
    const categoryMap = new Map();

    allActivities.forEach((activity) => {
      const rawDomain = activity.learningDomain?.trim();
      // console.log(rawDomain);

      const normalizedDomain = rawDomain?.toLowerCase();
      // console.log(normalizedDomain);


      if (!normalizedDomain) return;

      if (!categoryMap.has(normalizedDomain)) {
        categoryMap.set(normalizedDomain, {
          title: rawDomain, // keep original case for display
          ids: [activity._id],
        });
      } else {
        categoryMap.get(normalizedDomain).ids.push(activity._id);
      }
    });



    const categoryProgress = await Promise.all(
      Array.from(categoryMap.entries()).map(async ([_, { title, ids }]) => {
        const [totalInCategory, completedInCategory] = await Promise.all([
          ids.length,
          CompletedActivity.countDocuments({
            userId,
            activityId: { $in: ids },
          }),
        ]);

        const percentage =
          totalInCategory > 0
            ? Math.round((completedInCategory / totalInCategory) * 100)
            : 0;

        return {
          title,
          totalActivities: totalInCategory,
          finishedActivities: completedInCategory,
          percentage,
        };
      })
    );

    res.status(200).json({
      success: true,
      stats: {
        completedActivities: completedCount,
        badges: user.badges?.length || 0,
        weekPercentage,
        addedActivities: addedActivitiesCount,
      },
      categories: categoryProgress,
      isGuest: false,
    });
  } catch (err) {
    console.error("Error in getProgressStats:", err);
    res.status(500).json({ success: false, error: "Server Error" });
  }
};



export const getPlayWeekActivities = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const isGuest = !userId;
    let isTestFamily = false;
    let userAgeGroup = null;

    let userTimezone = req.headers['user-timezone'];
    console.log('user time zone', userTimezone);
    

    try {
      Intl.DateTimeFormat(undefined, { timeZone: userTimezone });
    } catch (e) {
      userTimezone = 'UTC'; 
    }

    if (userId) {
      const user = await User.findById(userId);
      if (user) {
        isTestFamily = user.isTestFamily;
        userAgeGroup = user.ageGroup;
        userTimezone = userTimezone || 'UTC'; 
        // console.log(`👤 User: ${user.username}`);
        // console.log(`🧒 Age Group: ${userAgeGroup || 'Not set'}`);
        // console.log(`🧪 Test Family: ${isTestFamily}`);
        // console.log(`🌍 Timezone: ${userTimezone}`);
      }
    }

    let activitySet;
    let weekNumber = 1;

    if (userId) {
      // REGISTERED USER LOGIC
      activitySet = await WeekPlaySet.findOne({ userId }).sort({ weekNumber: -1 });

      if (!activitySet) {
        // Create first week
        console.log(`🎯 Creating Week 1 for new user`);
        const currentMondayAt6AM = getCurrentMondayAt6AM(userTimezone);
        const freshActivities = await getTop5ActivitiesExcluding([], userAgeGroup, 1);

        activitySet = new WeekPlaySet({
          userId,
          activities: freshActivities.map(a => a._id),
          weekNumber: 1,
          generatedAt: currentMondayAt6AM,
          nextRefreshAt: getNextMondayAt6AM(userTimezone),
          completedActivitiesInWeek: [],
          isWeekCompleted: false,
          timezone: userTimezone
        });

        await activitySet.save();
        // console.log(`✅ Week 1 created with ${freshActivities.length} activities`);
      } else {
        // Check if we need Monday refresh
        const shouldRefresh = isPastMondayRefresh(activitySet.generatedAt, userTimezone);
        
        if (shouldRefresh) {
          console.log(`🔄 Monday 6 AM refresh triggered for user`);
          activitySet = await createNewMondayWeek(userId, activitySet, userAgeGroup, userTimezone);
        } else {
          console.log(`⏳ Current week still active until next Monday 6 AM`);
          // Update completion status but keep same activities
          const currentWeekCompleted = await CompletedActivity.find({
            userId,
            activityId: { $in: activitySet.activities },
            completedAt: { $gte: activitySet.generatedAt }
          });

          const completedActivityIds = currentWeekCompleted.map(c => c.activityId.toString());
          activitySet.completedActivitiesInWeek = completedActivityIds;
          activitySet.isWeekCompleted = completedActivityIds.length >= 5;
          await activitySet.save();
        }
      }

      weekNumber = activitySet.weekNumber;
    } else {
      // GUEST LOGIC
      console.log(`👤 Guest user session`);

      activitySet = req.session?.weeklyActivities;
      const lastRefresh = req.session?.lastMondayRefresh;
      
      const shouldRefresh = !activitySet || isPastMondayRefresh(lastRefresh, userTimezone);

      if (shouldRefresh) {
        const currentMondayAt6AM = getCurrentMondayAt6AM(userTimezone);
        const newWeekNumber = activitySet ? activitySet.weekNumber + 1 : 1;
        
        console.log(`🔄 Guest Monday refresh: Creating Week ${newWeekNumber}`);

        const previouslyUsedActivities = activitySet?.activities || [];
        const freshActivities = await getTop5ActivitiesExcluding(previouslyUsedActivities, null, newWeekNumber);

        activitySet = {
          activities: freshActivities.map(a => a._id),
          weekNumber: newWeekNumber,
          generatedAt: currentMondayAt6AM,
          nextRefreshAt: getNextMondayAt6AM(userTimezone),
          completedActivitiesInWeek: []
        };

        req.session.weeklyActivities = activitySet;
        req.session.weekNumber = newWeekNumber;
        req.session.completedActivitiesInWeek = [];
        req.session.lastMondayRefresh = currentMondayAt6AM.toISOString();

        console.log(`✅ Guest Week ${newWeekNumber} created`);
      } else {
        console.log(`⏳ Guest week still active until next Monday 6 AM`);
      }

      weekNumber = activitySet.weekNumber;
    }

    // Fetch activities and prepare response
    const activityDocs = await Activity.find({
      _id: { $in: activitySet.activities },
      isApproved: true,
    }).sort({ _id: 1 });

    let allTimeCompletedIds = [];
    let currentWeekCompletedIds = [];

    if (userId) {
      const allCompleted = await CompletedActivity.find({ userId });
      allTimeCompletedIds = allCompleted.map(a => a.activityId.toString());

      const currentWeekCompleted = await CompletedActivity.find({
        userId,
        activityId: { $in: activitySet.activities },
        completedAt: { $gte: activitySet.generatedAt }
      });

      currentWeekCompletedIds = currentWeekCompleted.map(a => a.activityId.toString());
    } else {
      currentWeekCompletedIds = req.session?.completedActivitiesInWeek || [];
      allTimeCompletedIds = req.session?.allTimeCompleted || [];
    }

    // Create activity list
    const activities = activityDocs.map((activity, index) => {
      const idStr = activity._id.toString();
      const isCompletedInCurrentWeek = currentWeekCompletedIds.includes(idStr);
      const isCompletedAllTime = allTimeCompletedIds.includes(idStr);

      let isLocked = true;

      if (isTestFamily) {
        isLocked = false;
      } else if (isGuest) {
        isLocked = index !== 0 && !isCompletedInCurrentWeek;
      } else {
        isLocked = index >= 3 && !isCompletedInCurrentWeek;
      }

      return {
        ...activity.toObject(),
        isCompleted: isCompletedAllTime,
        isCompletedInCurrentWeek,
        isLocked: isCompletedInCurrentWeek ? false : isLocked,
        activityIndex: index + 1,
      };
    });

    // Calculate timing info
    const nextRefreshAt = new Date(activitySet.nextRefreshAt || getNextMondayAt6AM(userTimezone));
    const now = new Date();
    const timeUntilRefresh = nextRefreshAt - now;
    const daysUntilRefresh = Math.max(0, Math.ceil(timeUntilRefresh / (1000 * 60 * 60 * 24)));
    const hoursUntilRefresh = Math.max(0, Math.ceil(timeUntilRefresh / (1000 * 60 * 60)));

    const completedThisWeek = currentWeekCompletedIds.length;
    const weekProgress = Math.round((completedThisWeek / 5) * 100);
    const isWeekCompleted = completedThisWeek >= 5;

    let weekStatusMessage = '';
    if (isWeekCompleted) {
      weekStatusMessage = `🎉 Week ${weekNumber} completed! New activities available next Monday at 6 AM`;
    } else {
      weekStatusMessage = `Complete ${5 - completedThisWeek} more activities to finish Week ${weekNumber}`;
    }

    let refreshMessage = '';
    if (daysUntilRefresh === 0) {
      refreshMessage = `🔄 New activities available now!`;
    } else if (daysUntilRefresh === 1) {
      refreshMessage = `⏰ New activities tomorrow at 6 AM`;
    } else {
      refreshMessage = `⏰ New activities in ${daysUntilRefresh} days (Monday 6 AM)`;
    }

    console.log(`🎯 FINAL: Returning Week ${weekNumber} activities (Monday refresh system)`);

    res.status(200).json({
      success: true,
      activities,
      weekInfo: {
        weekNumber,
        completedActivities: completedThisWeek,
        totalActivities: 5,
        weekProgress,
        isWeekCompleted,
        daysUntilRefresh,
        hoursUntilRefresh,
        nextRefreshAt: nextRefreshAt.toISOString(),
        currentWeekStart: new Date(activitySet.generatedAt).toISOString(),
        weekStatusMessage,
        refreshMessage,
        userAgeGroup: userAgeGroup || 'Not set',
        userTimezone,
        refreshSystem: 'Every Monday at 6 AM',
        activitiesIds: activities.map(a => a._id)
      }
    });
  } catch (err) {
    console.error('❌ Error in getPlayWeekActivities:', err);
    res.status(500).json({ error: "Server Error" });
  }
};

const createNewMondayWeek = async (userId, currentWeekSet, userAgeGroup, userTimezone) => {
  try {
    const currentMondayAt6AM = getCurrentMondayAt6AM(userTimezone);
    
    console.log(`🔄 Creating new Monday week from Week ${currentWeekSet.weekNumber} to Week ${currentWeekSet.weekNumber + 1}`);
    
    // Mark current week as finished
    const currentWeekCompleted = await CompletedActivity.find({
      userId,
      activityId: { $in: currentWeekSet.activities },
      completedAt: { $gte: currentWeekSet.generatedAt }
    });

    const completedActivityIds = currentWeekCompleted.map(c => c.activityId.toString());
    
    currentWeekSet.completedActivitiesInWeek = completedActivityIds;
    currentWeekSet.isWeekCompleted = completedActivityIds.length >= 5;
    currentWeekSet.weekEndedAt = new Date();
    await currentWeekSet.save();

    console.log(`📊 Week ${currentWeekSet.weekNumber} Final Status: ${completedActivityIds.length}/5 completed`);

    // Get all previously used activities
    const allPreviousWeeks = await WeekPlaySet.find({
      userId,
      weekNumber: { $lte: currentWeekSet.weekNumber }
    });

    const previouslyUsedActivities = [];
    allPreviousWeeks.forEach(week => {
      previouslyUsedActivities.push(...week.activities.map(id => id.toString()));
    });

    const newWeekNumber = currentWeekSet.weekNumber + 1;
    
    // Get fresh activities
    const freshActivities = await getTop5ActivitiesExcluding(
      previouslyUsedActivities, 
      userAgeGroup, 
      newWeekNumber
    );

    // Create new week set
    const newWeekSet = new WeekPlaySet({
      userId,
      activities: freshActivities.map(a => a._id),
      weekNumber: newWeekNumber,
      generatedAt: currentMondayAt6AM,
      nextRefreshAt: getNextMondayAt6AM(userTimezone),
      completedActivitiesInWeek: [],
      isWeekCompleted: false,
      previousWeekId: currentWeekSet._id,
      timezone: userTimezone
    });

    await newWeekSet.save();
    
    console.log(`✅ Created Week ${newWeekSet.weekNumber} with ${freshActivities.length} NEW activities`);
    
    return newWeekSet;

  } catch (error) {
    console.error('❌ Error in createNewMondayWeek:', error);
    return currentWeekSet;
  }
};

const getTop5ActivitiesExcluding = async (excludeIds = [], userAgeGroup = null, weekNumber = 1) => {
  try {
    console.log(`🎯 Getting 5 activities for Week ${weekNumber} (Monday System)`);
    
    const excludeObjectIds = excludeIds.map(id => {
      try {
        return new mongoose.Types.ObjectId(id);
      } catch (e) {
        return null;
      }
    }).filter(id => id !== null);

    let activities = [];

    // Age-based selection if user has age group set
    if (userAgeGroup) {
      console.log(`🎯 Age-based selection for: ${userAgeGroup}`);
      
      const ageBasedQuery = {
        isApproved: true,
        ageGroup: userAgeGroup,
        _id: { $nin: excludeObjectIds }
      };

      activities = await Activity.find(ageBasedQuery)
        .sort({
          averageRating: -1,
          createdAt: -1,
          _id: 1
        })
        .limit(10);

      console.log(`Found ${activities.length} activities for age group ${userAgeGroup}`);

      // Fill remaining slots with high-rated activities
      if (activities.length < 5) {
        const additionalQuery = {
          isApproved: true,
          _id: { $nin: [...excludeObjectIds, ...activities.map(a => a._id)] }
        };

        const additionalActivities = await Activity.find(additionalQuery)
          .sort({ 
            averageRating: -1,
            createdAt: -1,
            _id: 1
          })
          .limit(5 - activities.length);

        activities = [...activities, ...additionalActivities];
      }

    } else {
      // High-rated selection for users without age group
      console.log(`🎯 High-rated selection for Week ${weekNumber}`);
      
      const query = {
        isApproved: true,
        _id: { $nin: excludeObjectIds }
      };

      activities = await Activity.find(query)
        .sort({
          averageRating: -1,
          createdAt: -1,
          _id: 1
        })
        .limit(10);
    }

    // Final fallback
    if (activities.length < 5) {
      console.log('🆘 Final fallback - getting remaining activities');

      const usedIds = [...excludeObjectIds, ...activities.map(a => a._id)];
      const finalFallback = await Activity.find({ 
        isApproved: true,
        _id: { $nin: usedIds }
      })
      .sort({ 
        averageRating: -1, 
        createdAt: -1,
        _id: 1
      })
      .limit(5 - activities.length);

      activities = [...activities, ...finalFallback];
    }

    const finalActivities = activities.slice(0, 5);
    
    console.log(`✅ Monday System: Week ${weekNumber} activities selected:`);
    finalActivities.forEach((activity, index) => {
      console.log(`  ${index + 1}. ${activity.title} (Rating: ${activity.averageRating || 0})`);
    });

    return finalActivities;

  } catch (error) {
    console.error('❌ Error in getTop5ActivitiesExcluding:', error);
    
    // Emergency fallback
    return await Activity.find({ isApproved: true })
      .sort({ averageRating: -1, createdAt: -1, _id: 1 })
      .limit(5);
  }
};

const checkAndAwardMobileExplorer = async (userId, req) => {
  try {
    const user = await User.findById(userId);
    if (!user) return [];

    const badgeName = 'Mobile Explorer';
    const alreadyHasBadge = user.badges.includes(badgeName);

    if (alreadyHasBadge) return [];

    // Check if request is from mobile device
    const userAgent = req.headers['user-agent'] || '';
    const isMobile = /Mobile|Android|iPhone|iPad|iPod|Windows Phone/i.test(userAgent);

    if (!isMobile) return [];

    // Get completed activities from mobile (you'll need to track device type in CompletedActivity model)
    // For now, we'll check if current completion is on mobile and user has 3+ completions from mobile

    // Get all completed activities for this user
    const completedActivities = await CompletedActivity.find({ userId })
      .populate({
        path: 'activityId',
        match: { isApproved: true, learningDomain: 'zelfzorg' }, // Self-care activities
        select: 'learningDomain'
      });

    // Filter for self-care activities
    const selfCareCompletions = completedActivities.filter(comp =>
      comp.activityId && comp.activityId.learningDomain === 'zelfzorg'
    );

    // For this implementation, we'll assume if user is currently on mobile and has 3+ self-care completions
    // In a real implementation, you'd track device type in CompletedActivity model
    if (selfCareCompletions.length >= 3 && isMobile) {
      const badgeFromDB = await Badge.findOne({ name: badgeName });

      if (badgeFromDB) {
        user.badges.push(badgeName);
        await user.save();

        return [{
          _id: badgeFromDB._id,
          name: badgeFromDB.name,
          description: badgeFromDB.description,
          icon: badgeFromDB.icon,
          category: badgeFromDB.category,
        }];
      }
    }

    return [];

  } catch (error) {
    console.error('Error checking Mobile Explorer badge:', error);
    return [];
  }
};

const checkAndAwardSurpriseStreak = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) return [];

    const badgeName = 'Surprise Streak';
    const alreadyHasBadge = user.badges.includes(badgeName);

    if (alreadyHasBadge) return [];

    const completedActivities = await CompletedActivity.find({ userId })
      .sort({ completedAt: 1 });

    if (completedActivities.length === 0) return [];

    // Check for random engagement patterns (multiple criteria)
    const now = new Date();
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Recent activity in last 7 days
    const recentActivity = completedActivities.filter(activity =>
      new Date(activity.completedAt) >= last7Days
    ).length;

    // Activity in last 30 days
    const monthlyActivity = completedActivities.filter(activity =>
      new Date(activity.completedAt) >= last30Days
    ).length;

    // Check for various "surprise" criteria
    const totalBadges = user.badges.length;
    const hasConsistentEngagement = recentActivity >= 2 && monthlyActivity >= 5;
    const hasMultipleBadges = totalBadges >= 2;

    // Award badge based on random engagement criteria
    const surpriseCriteria = [
      hasConsistentEngagement,
      hasMultipleBadges,
      completedActivities.length >= 7, // Has completed at least 7 activities
      recentActivity >= 3 // Very active recently
    ];

    const metCriteria = surpriseCriteria.filter(Boolean).length;

    // Award if user meets at least 2 surprise criteria
    if (metCriteria >= 2) {
      const badgeFromDB = await Badge.findOne({ name: badgeName });

      if (badgeFromDB) {
        user.badges.push(badgeName);
        await user.save();

        return [{
          _id: badgeFromDB._id,
          name: badgeFromDB.name,
          description: badgeFromDB.description,
          icon: badgeFromDB.icon,
          category: badgeFromDB.category,
        }];
      }
    }

    return [];

  } catch (error) {
    console.error('Error checking Surprise Streak badge:', error);
    return [];
  }
};


export const getTotalActivitiesCount = async (req,res) =>{
  try{

    const getActivties = await Activity.countDocuments();
    return res.status(200).json(getActivties)

  } 
  catch(error){
    console.log(error);
    return res.status(500).json({error: 'Internal Server Error'})
    
  }
}



