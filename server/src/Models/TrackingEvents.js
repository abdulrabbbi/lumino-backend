import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false, // guests also play
  },
  userType: {
    type: String,
    enum: ["guest", "user"],
    default: "guest",
  },
  eventName: {
    type: String,
    required: true,
  },
  eventData: {
    type: Object, // flexible field for storing extra details
    default: {},
  },
  device: {
    type: String,
    default: "web",
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
},{ timestamps: true });

export default mongoose.models.TrackingEvents || mongoose.model("TrackingEvents", eventSchema);
