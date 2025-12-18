import mongoose from "mongoose";

const completedActivitySchema = new mongoose.Schema({
  activityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Activity', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, // null for guests
  userType: { type: String, enum: ['guest', 'user'], default: 'guest' },
  completedAt: { type: Date, default: Date.now }
});

export default mongoose.model("CompletedActivity", completedActivitySchema);
