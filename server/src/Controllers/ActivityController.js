import Activity from "../Models/Activity.js";
import CompletedActivity from "../Models/CompletedActivity.js";
import { v4 as uuidv4 } from 'uuid';
import User from "../Models/User.js";
import WeekPlaySet from "../Models/WeekPlaySet.js";
import Badge from "../Models/Badge.js";
import { isPastMondayRefresh, getCurrentMondayAt6AM, getNextMondayAt6AM } from "../Helper/ActivityHelper.js";
import mongoose from "mongoose";
import { checkAndAwardAreaBadges, checkAndAwardBounceBack, checkAndAwardCategoriesMaster, checkAndAwardChampion, checkAndAwardConsistencyChamp, checkAndAwardFiveInARow, checkAndAwardFocusFinisher, checkAndAwardGratitudeGiver, checkAndAwardMasterParent, checkAndAwardMobileExplorer, checkAndAwardStreakBuilder, checkAndAwardSurprisePlayer, checkAndAwardSurpriseStreak } from "../Helper/BadgeHelper.js";
import UserSubscription from "../Models/UserSubscription.js";

const checkUserSubscription = async (userId) => {
  if (!userId) return false;

  const userSubscription = await UserSubscription.findOne({
    userId,
    status: { $in: ['active', 'trial'] },
    orderStatus: 'paid'
  });

  return !!userSubscription;
};

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
    let hasSubscription = false;

    if (userId) {
      const user = await User.findById(userId);
      if (user) {
        isLoggedIn = true;
        isTestFamily = user.isTestFamily;
        hasSubscription = await checkUserSubscription(userId);
      }
    }

    // Pagination params
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Total count
    const totalItems = await Activity.countDocuments({ isApproved: true });

    // Get more activities for better sorting
    let activities = await Activity.find({
      isApproved: true
    })
      .sort({ createdAt: -1 });

    // If user is logged in, fetch completed activity IDs
    let completedActivityIds = [];
    if (userId) {
      const completedActivities = await CompletedActivity.find({ userId }).select("activityId");
      completedActivityIds = completedActivities.map(a => a.activityId.toString());
    }

    // Map activities with flags
    const enrichedActivities = activities.map(activity => {
      const isCompleted = completedActivityIds.includes(activity._id.toString());
      let isLocked = true;

      if (isLoggedIn && isTestFamily) {
        isLocked = false;
      }
      else if (isLoggedIn && hasSubscription) {
        isLocked = false;
      }
      else if (isLoggedIn && !hasSubscription) {
        isLocked = true;
      }
      else if (isCompleted) {
        isLocked = false;
      }

      return {
        ...activity.toObject(),
        isLocked,
        isCompleted
      };
    });

    // NEW: Sort by rating first (highest to lowest), then by review count if ratings are equal
    enrichedActivities.sort((a, b) => {
      const aRating = a.averageRating || 0;
      const bRating = b.averageRating || 0;

      // First by rating (highest to lowest)
      if (bRating !== aRating) {
        return bRating - aRating;
      }
      // Then by review count if ratings are equal
      const aReviewCount = a.ratings?.length || 0;
      const bReviewCount = b.ratings?.length || 0;
      return bReviewCount - aReviewCount;
    });

    // Then sort so incomplete activities come first within same quality tier
    enrichedActivities.sort((a, b) => {
      if (a.isCompleted === b.isCompleted) return 0;
      return a.isCompleted ? 1 : -1;
    });

    // Apply pagination after sorting
    const paginatedActivities = enrichedActivities.slice(skip, skip + limit);

    res.status(200).json({
      success: true,
      activities: paginatedActivities,
      pagination: {
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
        currentPage: page,
        limit
      }
    });
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

    const activity = await Activity.findById(id).populate("createdBy", "username");

    if (!activity) {
      return res.status(404).json({ success: false, error: "Activity not found." });
    }

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

    // Category filter
    if (category && category !== "Alle Leergebieden") {
      query.learningDomain = category
    }


    if (age && age !== 'alle-leeftijden') {
      const ageMap = {
        '3-4': '3 - 4',
        '3-6': '3 - 6', 
        '5-6': '5 - 6'
      };
    
      query.ageGroup = ageMap[age] || age;
      
      // console.log("Age filter applied:", age, "->", query.ageGroup); // Debug log
    }


    const userId = req.user?.userId
    let isTestFamily = false
    let isLoggedIn = false
    let completedActivityIds = new Set()
    let hasSubscription = false;

    if (userId) {
      const user = await User.findById(userId)
      if (user) {
        isLoggedIn = true
        isTestFamily = user.isTestFamily
        hasSubscription = await checkUserSubscription(userId);
        const completedActivities = await CompletedActivity.find({ userId }).select("activityId")
        completedActivityIds = new Set(completedActivities.map((c) => c.activityId.toString()))
      }
    }

    // Handle 'voltooid' filter
    if (sort === "voltooid") {
      if (!isLoggedIn) {
        return res.status(200).json({
          success: true,
          activities: [],
          message: "Login required to view completed activities.",
        })
      }
      query._id = { $in: Array.from(completedActivityIds).map((id) => new mongoose.Types.ObjectId(id)) }
    }

    const activities = await Activity.find(query).exec()

    const finalActivities = activities.map((activity) => {
      const activityObject = activity.toObject()
      let isLocked = true
      if (isLoggedIn && isTestFamily) {
        isLocked = false;
      }
      else if (isLoggedIn && hasSubscription) {
        isLocked = false;
      }
      else if (isLoggedIn && !hasSubscription) {
        isLocked = true;
      }
      else {
        isLocked = true;
      }
      const isCompleted = completedActivityIds.has(activityObject._id.toString())

      // Calculate review count for sorting
      const reviewCount = activityObject.ratings?.length || 0;

      return {
        ...activityObject,
        isLocked,
        isCompleted,
        reviewCount
      }
    })

    // Apply NEW sorting logic
    if (sort === "hoogstgewaardeerde") {
      // NEW: Sort by rating first, then by review count if ratings are equal
      finalActivities.sort((a, b) => {
        const aRating = a.averageRating || 0;
        const bRating = b.averageRating || 0;

        // First by rating (highest to lowest)
        if (bRating !== aRating) {
          return bRating - aRating;
        }
        // Then by review count if ratings are equal (more reviews first)
        return b.reviewCount - a.reviewCount;
      });
    } else if (sort === "meestgewaardeerde") {
      // Sort by number of ratings (reviewCount), then by averageRating if counts are equal
      finalActivities.sort((a, b) => {
        if (b.reviewCount !== a.reviewCount) {
          return b.reviewCount - a.reviewCount; // More reviews first
        }
        const aRating = a.averageRating || 0;
        const bRating = b.averageRating || 0;
        return bRating - aRating; // Higher rating first if reviewCount is equal
      });
    }


    // Default sorting: uncompleted activities first, then completed activities
    if (sort !== "voltooid") {
      finalActivities.sort((a, b) => {
        if (a.isCompleted && !b.isCompleted) return 1
        if (!a.isCompleted && b.isCompleted) return -1
        return 0
      })
    }

    // Remove the reviewCount from final response (it's just for sorting)
    const responseActivities = finalActivities.map(activity => {
      const { reviewCount, ...activityWithoutCount } = activity;
      return activityWithoutCount;
    });

    res.status(200).json({ success: true, activities: responseActivities })
  } catch (error) {
    console.error("Error filtering activities:", error)
    res.status(500).json({ message: "Server error" })
  }
}
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

    let weekPercentage = 0;

    const currentWeekSet = await WeekPlaySet.findOne({ userId }).sort({ weekNumber: -1 });

    if (currentWeekSet) {
      // Count only activities completed from the current week set since it was generated
      const currentWeekCompleted = await CompletedActivity.find({
        userId,
        activityId: { $in: currentWeekSet.activities }, // ✅ Only current week activities
        completedAt: { $gte: currentWeekSet.generatedAt } // ✅ Since current week started
      });



      const completedCount = currentWeekCompleted.length;
      const totalActivities = currentWeekSet.activities.length;



      weekPercentage = Math.min(Math.round((completedCount / totalActivities) * 100), 100);

    } else {
      console.log('🔍 Debug - No current week set found for user');
    }

    const allActivities = await Activity.find({ isApproved: true });
    const categoryMap = new Map();

    allActivities.forEach((activity) => {
      const rawDomain = activity.learningDomain?.trim();

      const normalizedDomain = rawDomain?.toLowerCase();

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

     weekPercentage = weekPercentage ? weekPercentage : 0

    res.status(200).json({
      success: true,
      stats: {
        completedActivities: completedCount,
        badges: user.badges?.length || 0,
        weekPercentage, // ✅ Now correctly calculated
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
    let hasSubscription = false;

    let userTimezone = req.headers['user-timezone'];


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
        hasSubscription = await checkUserSubscription(userId);
      }
    }

    let activitySet;
    let weekNumber = 1;

    if (userId) {
      activitySet = await WeekPlaySet.findOne({ userId }).sort({ weekNumber: -1 });

      if (!activitySet) {
        // Create first week
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
      } else {
        const shouldRefresh = isPastMondayRefresh(activitySet.generatedAt, userTimezone);

        if (shouldRefresh) {
          activitySet = await createNewMondayWeek(userId, activitySet, userAgeGroup, userTimezone);
        } else {
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
      activitySet = req.session?.weeklyActivities;
      const lastRefresh = req.session?.lastMondayRefresh;

      const shouldRefresh = !activitySet || isPastMondayRefresh(lastRefresh, userTimezone);

      if (shouldRefresh) {
        const currentMondayAt6AM = getCurrentMondayAt6AM(userTimezone);
        const newWeekNumber = activitySet ? activitySet.weekNumber + 1 : 1;


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
      } else {
        // console.log(`⏳ Guest week still active until next Monday 6 AM`);
      }

      weekNumber = activitySet.weekNumber;
    }

    // Fetch activities and prepare response - PRESERVE THE ORIGINAL ORDER
    const activityDocs = await Activity.find({
      _id: { $in: activitySet.activities },
      isApproved: true,
    });

    // Create a map for easy lookup
    const activityMap = new Map();
    activityDocs.forEach(activity => {
      activityMap.set(activity._id.toString(), activity);
    });

    // Reconstruct activities in the original order from activitySet.activities
    const orderedActivities = activitySet.activities.map(activityId => {
      return activityMap.get(activityId.toString());
    }).filter(activity => activity !== undefined);

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

    // Create activity list - use orderedActivities instead of activityDocs
    const activities = orderedActivities.map((activity, index) => {
      const idStr = activity._id.toString();
      const isCompletedInCurrentWeek = currentWeekCompletedIds.includes(idStr);
      const isCompletedAllTime = allTimeCompletedIds.includes(idStr);

      let isLocked = true;

      // Test family users - everything unlocked
      if (isTestFamily) {
        isLocked = false;
      }
      // Users with subscription - everything unlocked
      else if (userId && hasSubscription) {
        isLocked = false;
      }
      // Users without subscription - first 3 unlocked, rest locked
      else if (userId && !hasSubscription) {
        isLocked = index >= 3 && !isCompletedInCurrentWeek;
      }
      // Guest users - existing logic
      else if (isGuest) {
        isLocked = index !== 0 && !isCompletedInCurrentWeek;
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


    const currentWeekCompleted = await CompletedActivity.find({
      userId,
      activityId: { $in: currentWeekSet.activities },
      completedAt: { $gte: currentWeekSet.generatedAt }
    });

    const completedActivityIds = currentWeekCompleted.map(c => c.activityId.toString());

    currentWeekSet.completedActivitiesInWeek = completedActivityIds;
    currentWeekSet.isWeekCompleted = true; // ✅ Always true when week ends
    currentWeekSet.weekEndedAt = new Date();
    await currentWeekSet.save();


    const allPreviousWeeks = await WeekPlaySet.find({
      userId,
      weekNumber: { $lte: currentWeekSet.weekNumber }
    });

    const previouslyUsedActivities = [];
    allPreviousWeeks.forEach(week => {
      previouslyUsedActivities.push(...week.activities.map(id => id.toString()));
    });

    const allCompletedActivities = await CompletedActivity.find({ userId });
    const allCompletedActivityIds = allCompletedActivities.map(c => c.activityId.toString());

    const activitiesToExclude = [...new Set([...previouslyUsedActivities, ...allCompletedActivityIds])];

    const newWeekNumber = currentWeekSet.weekNumber + 1;

    const freshActivities = await getTop5ActivitiesExcluding(
      activitiesToExclude,
      userAgeGroup,
      newWeekNumber
    );

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

    return newWeekSet;

  } catch (error) {
    console.error('❌ Error in createNewMondayWeek:', error);
    return currentWeekSet;
  }
};
const getTop5ActivitiesExcluding = async (excludeIds = [], userAgeGroup = null, weekNumber = 1) => {
  try {
    const excludeObjectIds = excludeIds.map(id => {
      try {
        return new mongoose.Types.ObjectId(id);
      } catch (e) {
        return null;
      }
    }).filter(id => id !== null);

    const query = {
      isApproved: true,
      _id: { $nin: excludeObjectIds },
      "ratings.2": { $exists: true }
    };

    // Sort by averageRating descending first, then by ratings.length descending
    const activities = await Activity.find(query)
      .sort({
        averageRating: -1,
        "ratings.length": -1,
        createdAt: -1
      })
      .limit(5);

    activities.forEach((activity, index) => {
      const reviewCount = activity.ratings?.length || 0;
      console.log(`  ${index + 1}. ${activity.title} (Rating: ${activity.averageRating || 0}, Reviews: ${reviewCount})`);
    });

    return activities;

  } catch (error) {
    console.error('Error in getTop5ActivitiesExcluding:', error);
    return [];
  }
};


export const getTotalActivitiesCount = async (req, res) => {
  try {

    const getActivties = await Activity.countDocuments();
    return res.status(200).json(getActivties)

  }
  catch (error) {
    console.log(error);
    return res.status(500).json({ error: 'Internal Server Error' })

  }
}



