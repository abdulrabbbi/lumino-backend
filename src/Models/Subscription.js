import mongoose from "mongoose";

const SubscriptionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    key: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, required: true },
    details: { type: [String], default: [] },
    price: { type: Number, required: true },
    originalPrice: { type: Number },
    discount: { type: Number, default: 0 },
    priceType: { type: String, enum: ["monthly", "yearly", "one-time"], required: true },
    trialPeriodDays: { type: Number, default: 0 },
    currency: { type: String, default: "EUR" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.Subscription ||
  mongoose.model("Subscription", SubscriptionSchema);