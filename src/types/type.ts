import mongoose, { Document } from "mongoose";

export interface UserTypes extends Document {
  _id: mongoose.Schema.Types.ObjectId;
  username: string;
  password: string;
  email: string;
  role: string;
  twoFactorSecret?: string; // Optional for 2FA
  activeSession: { deviceId: string; timestamp: number; token: string }[];
}

export interface Methods {
  comparePassword(password: string): Promise<boolean>;
  setup2FASecret(): string;
  verify2FAToken(token: string): boolean;
  generateQRCode(): Promise<string>;
}
