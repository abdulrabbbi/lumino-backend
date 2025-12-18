import mongoose from "mongoose";

const weekPlaySetSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  activities: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Activity' }],
  weekNumber: { type: Number, default: 1 },
  generatedAt: { type: Date, default: Date.now },
  completedActivitiesInWeek: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Activity' }],
  isWeekCompleted: { type: Boolean, default: false }
});


export default mongoose.model("WeekPlaySet", weekPlaySetSchema);
