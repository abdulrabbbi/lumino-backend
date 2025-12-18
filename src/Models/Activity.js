import mongoose from "mongoose";

const activitySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },

    instructions: [{ type: String, trim: true }],
    materials: { type: String, trim: true },

    learningDomain: { type: String, required: true, trim: true, index: true },

    creatorName: { type: String, maxlength: 50, trim: true },

    isApproved: { type: Boolean, default: false, index: true },

    status: {
      type: String,
      enum: ["Actief", "Concept", "Voltooid"],
      default: "Concept",
      index: true,
    },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },

    category: {
      type: String,
      enum: ["playweek", "library"],
      default: "library",
      index: true,
    },

    ratings: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
        guestId: { type: String, default: null },
        value: { type: Number, min: 1, max: 10, required: true },
      },
    ],

    averageRating: { type: Number, default: 0, index: true },

    nickname: { type: String, maxlength: 50, trim: true },
    ageGroup: { type: String, trim: true, index: true },

    time: { type: String, trim: true },
    effect: { type: String, trim: true },
    parentInstructions: { type: String, trim: true },
  },
  { timestamps: true } 
);

activitySchema.index({ isApproved: 1, createdAt: -1 });
activitySchema.index({ isApproved: 1, averageRating: -1, createdAt: -1 });
activitySchema.index({ learningDomain: 1, ageGroup: 1, isApproved: 1 });
activitySchema.index({ createdBy: 1, isApproved: 1, createdAt: -1 });
activitySchema.index({ userId: 1, createdAt: -1 });

activitySchema.index({ title: "text", description: "text" });

export default mongoose.model("Activity", activitySchema);
