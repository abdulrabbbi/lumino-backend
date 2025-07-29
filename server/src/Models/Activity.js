import mongoose from "mongoose";

const activitySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, maxlength: 60 },
  description: { type: String, required: true, maxlength: 250 },
  instructions: [{ type: String, maxlength: 180 }],
  materials: { type: String },
  learningDomain: { type: String, required: true },
  creatorName: { type: String, maxlength: 50 },
  isApproved: { type: Boolean, default: false },
  status: { type: String, enum: ['Actief', 'Concept', 'Voltooid'], default: 'Concept' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  category: { type: String, enum: ['playweek', 'library'], default: 'library' },
  createdAt: { type: Date, default: Date.now },
  ratings: [{ user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null }, value: { type: Number, min: 1, max: 10 } }],
  averageRating: { type: Number, default: 0 },
  nickname: { type: String, maxlength: 50 },
  ageGroup: { type: String }, 
  time: { type: String},
  effect: {type: String},
  parentInstructions: {type: String}
});

export default mongoose.model("Activity", activitySchema);
