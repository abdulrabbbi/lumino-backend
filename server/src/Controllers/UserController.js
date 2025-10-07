import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../Models/User.js";
import { generateReferralCode } from "../Helper/Helper.js";
import nodemailer from "nodemailer";
import Subscription from "../Models/Subscription.js";
import UserSubscription from "../Models/UserSubscription.js";
import GuestEmail from "../Models/GuestEmail.js";
import { awardFreeMonth } from "./referralController.js";
import Referral from "../Models/Referral.js";
import { logEvent } from "../Utils/log-event.js";

export const register = async (req, res) => {
  try {
    const { username, email, password, referralCode: referredByCode } = req.body; 

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate referral code for the new user
    let userReferralCode;
    let isUnique = false;
    while (!isUnique) {
      userReferralCode = generateReferralCode();
      const existingUser = await User.findOne({ referralCode: userReferralCode });
      if (!existingUser) {
        isUnique = true;
      }
    }

    // Check if referred by someone
    let referredBy = null;
    let referralApplied = false;
    let referrer = null;
    
    if (referredByCode) {
      referrer = await User.findOne({ referralCode: referredByCode });
      if (referrer && referrer.email !== email) { // Prevent self-referral
        referredBy = referrer._id;
        referralApplied = true;
      }
    }

    // Create the user
    const user = new User({
      username,
      email,
      password: hashedPassword,
      role: "user",
      referralCode: userReferralCode,
      referredBy,
      badges: []
    });

    await user.save();

    logEvent({
      userId: user._id,
      userType: "user",
      eventName: "signup",
      eventData: { method: "email" },
    });

    // Process referral after user is created
    if (referralApplied && referrer) {
      // Create referral record
      const referral = new Referral({
        referrerId: referrer._id,
        refereeId: user._id,
        referralCode: referredByCode,
        status: 'completed',
        completedAt: new Date()
      });
      await referral.save();
      
      // Award free months to both users
      await awardFreeMonth(referrer._id, `Referral reward for referring ${email}`);
      await awardFreeMonth(user._id, `Referral reward for using code from ${referrer.email}`);
      
      // Update referral count for referrer
      referrer.referralCount += 1;
      await referrer.save();
    }

    res.status(201).json({ 
      success: true, 
      message: "User registered successfully",
      referralApplied,
      referrer: referrer ? referrer.email : null
    });
  } catch (error) {
    console.log("Registration error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const payload = {
      userId: user._id,
      role: user.role,
      isTestFamily: user.isTestFamily,
      username: user.username
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET);

    logEvent({
      userId: user._id,
      userType: "user",
      eventName: "login",
      eventData: { method: "email" },
    });

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
    res.status(500).json({       success: false,
      message: "Server Error" });
  }
};
export const sendResetOTP = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.resetPasswordOTP = otp;
    user.resetPasswordOTPExpires = Date.now() + 10 * 60 * 1000;
    await user.save();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Password Reset OTP",
      text: `Your OTP to reset password is: ${otp}`,
    });

    res.status(200).json({ success: true, message: "OTP sent to email" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
export const verifyResetOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });

    if (!user || !user.resetPasswordOTP)
      return res.status(400).json({ message: "OTP not requested" });

    if (user.resetPasswordOTP !== otp)
      return res.status(400).json({ message: "Invalid OTP" });

    if (Date.now() > user.resetPasswordOTPExpires)
      return res.status(400).json({ message: "OTP expired" });

    res.status(200).json({ success:true, message: "OTP verified" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
export const resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    const user = await User.findOne({ email });

    if (!user)
      return res.status(400).json({ message: "OTP not requested" });

    // if (user.resetPasswordOTP !== otp)
    //   return res.status(400).json({ message: "Invalid OTP" });

    // if (Date.now() > user.resetPasswordOTPExpires)
    //   return res.status(400).json({ message: "OTP expired" });

    user.password = await bcrypt.hash(newPassword, 10);

    user.resetPasswordOTP = null;
    user.resetPasswordOTPExpires = null;

    await user.save();

    res.status(200).json({ success: true, message: "Password reset successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
export const checkUserSubscription = async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });



    let subscriptionInfo = null;

    if (user.isTestFamily) {
      const lifetimePlan = await Subscription.findOne({ priceType: 'one-time' });
      subscriptionInfo = {
        status: 'Active',
        subscription: lifetimePlan,
        isTestUser: true
      };
    } else {
      // YEH LINE CHANGE KARO - 'trial' status bhi include karo
      const userSub = await UserSubscription.findOne({ 
        userId, 
        status: { $in: ['active', 'trial'] } // BOTH active AND trial
      }).populate('subscriptionId');
      
      if (userSub) {
        subscriptionInfo = {
          status: userSub.status,
          subscription: userSub.subscriptionId,
          startDate: userSub.startDate,
          endDate: userSub.endDate,
          trialEndDate: userSub.trialEndDate, // Trial end date bhi include karo
          isTestUser: false
        };
      }
    }

    if (subscriptionInfo) {
      return res.json({ hasSubscription: true, ...subscriptionInfo });
    } else {
      return res.json({ hasSubscription: false });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Server error' });
  }
}
export const guestUserEmail = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Please provide a valid email address' });
    }

    const existingEmail = await GuestEmail.findOne({ email });
    if (existingEmail) {
      return res.status(200).json({ message: 'Email already registered' });
    }

    const newGuestEmail = new GuestEmail({
      email,
      pageVisited: req.headers.referer || 'unknown'
    });

    await newGuestEmail.save();

    res.status(201).json({ message: 'Email saved successfully' });
  } catch (error) {
    console.error('Error saving guest email:', error);
    res.status(500).json({ message: 'Error saving email' });
  }
}
export const getUserDetail = async (req,res) =>{
  try{

    const userId = req.user.userId
    if(!userId){
      res.status(401).json({message: 'Unauthorized'})
    }
    const details = await User.findById(userId)
    res.status(200).json(details)

  }
  catch(error){
    console.log(error);
    res.status(500).json({message: 'Internal Server Error'})
    
  }
}

