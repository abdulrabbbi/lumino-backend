import mongoose from 'mongoose';

const UserPlayWeekSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  weekNumber: {
    type: Number,
    required: true
  },
  activityIds: [
    {
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Activity'
    }
  ]
}, { timestamps: true });

UserPlayWeekSchema.index({ userId: 1, weekNumber: 1 }, { unique: true });

export default mongoose.model('UserPlayWeek', UserPlayWeekSchema);
