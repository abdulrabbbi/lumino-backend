import mongoose from "mongoose";

const RewardSettingSchema = new mongoose.Schema({
  month: { type: String, required: true, unique: true }, // e.g. "2025-09"
  rewardPool: { type: Number, required: true, default: 2500 },
});

export default mongoose.model("RewardSetting", RewardSettingSchema);
