import mongoose from "mongoose";

const BlockedIPSchema = new mongoose.Schema({
  ip: { type: String, required: true },
  expiresAt: { type: Number, required: true },
});

export const BlockedIP = mongoose.model("BlockedIP", BlockedIPSchema);
