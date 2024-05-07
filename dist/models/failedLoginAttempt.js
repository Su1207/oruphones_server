import mongoose from "mongoose";
const FailedLoginAttemptSchema = new mongoose.Schema({
    ip: { type: String, required: true },
    attempts: { type: Number, default: 0, required: true },
    lastAttemptAt: { type: Number, required: true, default: Date.now() },
});
export const FailedLoginAttempts = mongoose.model("FailedLoginAttempts", FailedLoginAttemptSchema);
