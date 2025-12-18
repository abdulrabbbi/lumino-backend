import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    role: { type: String, enum: ["user", "admin"], default: "user" },

    firstName: { type: String },
    surname: { type: String },
    ageGroup: { type: String },
    language: { type: String },
    badges: { type: [String], default: [] },

    notificationsEnabled: { type: Boolean, default: false },
    weeklyProgressEnabled: { type: Boolean, default: false },

    referralCode: { type: String, unique: true, sparse: true },
    referredBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    referralCount: { type: Number, default: 0 },
    referralRewards: [
      {
        type: { type: String, enum: ["free_month", "other"] },
        awardedAt: { type: Date, default: Date.now },
        reason: String,
        expiresAt: Date,
      },
    ],

    resetPasswordOTP: { type: String, select: false },
    resetPasswordOTPExpires: { type: Date, select: false },

    subscription: { type: String, default: null },
    subscriptionActive: { type: Boolean, default: false },
    subscriptionExpiresAt: { type: Date, default: null },
    isInTrial: { type: Boolean, default: false },
    trialEndDate: { type: Date, default: null },
    stripeCustomerId: { type: String, default: null },

    isTestFamily: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    socialShares: [
      {
        platform: String, // 'facebook', 'twitter', 'instagram', etc.
        content: String,
        activityId: { type: mongoose.Schema.Types.ObjectId, ref: "Activity" },
        sharedAt: { type: Date, default: Date.now },
      },
    ],
    lastActivityShare: {
      week: Number,
      year: Number,
      timestamp: Date,
    },
    shareHistory: [
      {
        activityId: mongoose.Schema.Types.ObjectId,
        week: Number,
        year: Number,
        timestamp: Date,
      },
    ],
  },
  { timestamps: true }
);

userSchema.index({ role: 1, createdAt: -1 });
userSchema.index({ referredBy: 1, createdAt: -1 });
userSchema.index({ subscriptionActive: 1, subscriptionExpiresAt: 1 });

userSchema.set("toJSON", {
  transform: (_doc, ret) => {
    delete ret.password;
    delete ret.resetPasswordOTP;
    delete ret.resetPasswordOTPExpires;
    return ret;
  },
});

export default mongoose.model("User", userSchema);
