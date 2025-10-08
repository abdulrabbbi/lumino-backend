import mongoose from "mongoose";

const favoriteSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  activityId: { type: mongoose.Schema.Types.ObjectId, ref: "Activity", required: true },
  createdAt: { type: Date, default: Date.now },
});

// To prevent duplicate favorites
favoriteSchema.index({ userId: 1, activityId: 1 }, { unique: true });

export default mongoose.model("Favorite", favoriteSchema);
