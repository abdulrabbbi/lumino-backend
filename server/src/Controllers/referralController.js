// controllers/referralController.js - UPDATED
import User from "../Models/User.js";
import Referral from "../Models/Referral.js";
import { v4 as uuidv4 } from 'uuid';

// Generate unique referral code
const generateReferralCode = () => {
  return uuidv4().substring(0, 8).toUpperCase();
};

// Get or create referral code for user
export const getOrCreateReferralCode = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    if (!user.referralCode) {
      let referralCode;
      let isUnique = false;
      
      while (!isUnique) {
        referralCode = generateReferralCode();
        const existingUser = await User.findOne({ referralCode });
        if (!existingUser) {
          isUnique = true;
        }
      }
      
      user.referralCode = referralCode;
      await user.save();
    }
    
    return user.referralCode;
  } catch (error) {
    console.error("Error generating referral code:", error);
    throw error;
  }
};

// Get user's referral code
export const getReferralCode = async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const referralCode = await getOrCreateReferralCode(userId);
    
    res.status(200).json({
      success: true,
      referralCode,
      referralLink: `${process.env.FRONTEND_URL}/signup?ref=${referralCode}`
    });
  } catch (error) {
    console.error("Error getting referral code:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Apply referral code after signup (NEW FUNCTION)
export const applyReferralCodeAfterSignup = async (req, res) => {
  try {
    const { referralCode } = req.body;
    const userId = req.user?.userId;
    
    if (!referralCode || !userId) {
      return res.status(400).json({ error: "Referral code and user ID are required" });
    }

    // Find referrer by code
    const referrer = await User.findOne({ referralCode });
    if (!referrer) {
      return res.status(404).json({ error: "Invalid referral code" });
    }

    // Check if user already used a referral code
    const user = await User.findById(userId);
    if (user.referredBy) {
      return res.status(400).json({ error: "User already used a referral code" });
    }

    // Check if user is referring themselves
    if (referrer._id.toString() === userId) {
      return res.status(400).json({ error: "Cannot use your own referral code" });
    }

    const referral = new Referral({
      referrerId: referrer._id,
      refereeId: userId,
      referralCode,
      status: 'completed',
      completedAt: new Date()
    });

    await referral.save();

    // Update user with referrer info
    user.referredBy = referrer._id;
    await user.save();

    // Award free month to both users
    await awardFreeMonth(referrer._id, `Referral reward for referring ${user.email}`);
    await awardFreeMonth(userId, `Referral reward for using code from ${referrer.email}`);

    // Update referral count for referrer
    referrer.referralCount += 1;
    await referrer.save();

    res.status(200).json({
      success: true,
      message: "Referral code applied successfully. Both users received 1 month free!",
      referrer: referrer.email
    });
  } catch (error) {
    console.error("Error applying referral code:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Award free month function
export const awardFreeMonth = async (userId, reason) => {
  try {
    const user = await User.findById(userId);
    if (!user) return;

    const now = new Date();
    const oneMonthFromNow = new Date(now);
    oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);

    // Add to referral rewards
    user.referralRewards.push({
      type: 'free_month',
      reason,
      awardedAt: now,
      expiresAt: oneMonthFromNow
    });

    // Update subscription
    if (!user.subscriptionActive || new Date(user.subscriptionExpiresAt) < now) {
      user.subscriptionActive = true;
      user.subscriptionExpiresAt = oneMonthFromNow;
      user.subscription = 'premium';
    } else if (new Date(user.subscriptionExpiresAt) > now) {
      // Extend existing subscription
      const currentExpiry = new Date(user.subscriptionExpiresAt);
      currentExpiry.setMonth(currentExpiry.getMonth() + 1);
      user.subscriptionExpiresAt = currentExpiry;
    }

    await user.save();
  } catch (error) {
    console.error("Error awarding free month:", error);
  }
};

// Get referral statistics
export const getReferralStats = async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const user = await User.findById(userId);
    const referrals = await Referral.find({ referrerId: userId })
      .populate('refereeId', 'email createdAt')
      .sort({ createdAt: -1 });

    const successfulReferrals = referrals.filter(ref => ref.status === 'completed');

    res.status(200).json({
      success: true,
      stats: {
        totalReferrals: referrals.length,
        successfulReferrals: successfulReferrals.length,
        referralCount: user.referralCount,
        referralCode: user.referralCode,
        referralLink: `${process.env.FRONTEND_URL}/signup?ref=${user.referralCode}`
      },
      referrals: successfulReferrals.map(ref => ({
        email: ref.refereeId.email,
        joinedAt: ref.refereeId.createdAt,
        rewardedAt: ref.completedAt
      }))
    });
  } catch (error) {
    console.error("Error getting referral stats:", error);
    res.status(500).json({ error: "Server error" });
  }
};

// Check if user has active referral reward
export const checkReferralReward = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) return false;

    const now = new Date();
    const activeReward = user.referralRewards.find(reward => 
      reward.expiresAt && new Date(reward.expiresAt) > now
    );

    return !!activeReward;
  } catch (error) {
    console.error("Error checking referral reward:", error);
    return false;
  }
};