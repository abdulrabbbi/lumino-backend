import mongoose from "mongoose";

const BadgeSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    icon: { type: String, required: true },
    category: { type: String, required: true },
})

export default mongoose.model("Badge", BadgeSchema);
