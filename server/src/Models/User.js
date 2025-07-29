import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },

  role: { type: String, enum: ['user', 'admin'], default: 'user' },

  firstName: { type: String },
  surname: { type: String },
  ageGroup: { type: String }, 
  language: { type: String },
  badges: { type: [String], default: [] },

  notificationsEnabled: { type: Boolean, default: false },
  weeklyProgressEnabled: { type: Boolean, default: false },

  referralCode: { type: String, unique: true, sparse: true }, 
  referredBy: { type: String }, 

  resetPasswordOTP: {
    type: String,
  },
  resetPasswordOTPExpires: {
    type: Date,
  },

  subscription: {
    type: String, // 'proefreis' | 'jaaravontuur' | 'eeuwigsterk'
    default: null
  },
  subscriptionActive: {
    type: Boolean,
    default: false
  },
  subscriptionExpiresAt: {
    type: Date,
    default: null
  },

  isTestFamily: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  socialShares: [{
    platform: String, // 'facebook', 'twitter', 'instagram', etc.
    content: String,
    activityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Activity' },
    sharedAt: { type: Date, default: Date.now }
  }]

}, { timestamps: true })

export default mongoose.model('User', userSchema)
