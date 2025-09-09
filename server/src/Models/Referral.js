import mongoose from "mongoose";

const referralSchema = new mongoose.Schema({
  referrerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  refereeId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  referralCode: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'completed', 'rewarded'], 
    default: 'pending' 
  },
  rewardGiven: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  completedAt: { type: Date },
  rewardGivenAt: { type: Date }
});

export default mongoose.model("Referral", referralSchema);