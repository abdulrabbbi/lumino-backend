import Badge from "../Models/Badge.js";
import User from "../Models/User.js";

export const getProfileInfo = async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const user = await User.findById(userId).lean();
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    let firstName = user.firstName;
    let surname = user.surname;

    if (!firstName || !surname) {
      const parts = user.username.split(" ");
      firstName = parts[0] || "";
      surname = parts.slice(1).join(" ") || "";
    }

    res.status(200).json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        firstName,
        surname,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server Error" });
  }
};
export const updateChildSetting = async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { ageGroup } = req.body;

    let cleanAgeGroup;
    if (ageGroup) {
      cleanAgeGroup = ageGroup.replace(/^Age\s*/i, "").trim();
      if (!/^\d+\s*-\s*\d+$/.test(cleanAgeGroup)) {
        return res
          .status(400)
          .json({
            error: "Invalid age group format. Should be like 'Age 3 - 4'",
          });
      }
    } else {
      return res.status(400).json({ error: "Age group is required" });
    }

    const update = { ageGroup: cleanAgeGroup };

    const user = await User.findByIdAndUpdate(userId, update, { new: true });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({
      message: "Child settings updated successfully",
      user,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server Error" });
  }
};
export const updateNotificationSettings = async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { notificationsEnabled, weeklyProgressEnabled } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      {
        notificationsEnabled: !!notificationsEnabled,
        weeklyProgressEnabled: !!weeklyProgressEnabled,
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({
      message: "Notification settings updated successfully",
      user,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server Error" });
  }
};
export const getUserBadges = async (req, res) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const earnedBadges = await Badge.find({
      name: { $in: user.badges },
    });

    res.status(200).json({
      success: true,
      badges: earnedBadges,
    });
  } catch (err) {
    console.error("Error fetching badges:", err);
    res.status(500).json({ success: false, error: "Server Error" });
  }
};
export const getBadgePercentage = async (req,res) =>{
  try {
    const userId  = req.user.userId;


    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    const totalBadges = await Badge.countDocuments()
    const earnedBadges = user.badges.length
    const percentage = totalBadges === 0 ? 0 : ((earnedBadges / totalBadges) * 100).toFixed(2)

    return res.json({
      earned: earnedBadges,
      total: totalBadges,
      percentage: Number(percentage),
    })
  } catch (err) {
    console.error('Error fetching badge summary:', err)
    res.status(500).json({ message: 'Internal server error' })
  }
}

export const checkProfileExists = async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // console.log(user);
    

    const hasProfile = user.ageGroup;
    console.log(hasProfile);
    

    res.status(200).json({
      profileExists: hasProfile
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server Error" });
  }
};