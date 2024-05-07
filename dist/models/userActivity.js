import mongoose from "mongoose";
const userActivitySchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    type: { type: String, enum: ["login", "logout"] },
    timestamp: { type: Number },
    device: { type: String },
});
export const UserActivity = mongoose.model("UserActivity", userActivitySchema);
