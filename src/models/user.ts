import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { Methods, UserTypes } from "../types/type.js";
import speakeasy from "speakeasy";
import qrcode from "qrcode";

const schema = new mongoose.Schema<UserTypes, {}, Methods>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    username: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    twoFactorSecret: { type: String },
    activeSession: [
      {
        deviceId: { type: String },
        timestamp: { type: Number },
        token: { type: String },
      },
    ],
  },
  {
    timestamps: true,
  }
);

schema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

schema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

schema.methods.setup2FASecret = function () {
  if (!this.twoFactorSecret) {
    // Generate a TOTP secret key
    const secret = speakeasy.generateSecret({ length: 20 }).base32;
    this.twoFactorSecret = secret;
  }
  return this.twoFactorSecret;
};

//generate QR code
schema.methods.generateQRCode = async function () {
  if (this.twoFactorSecret) {
    const dynamicPath = `/qrcode/${this.email}/${Date.now()}`;

    // Construct the OTP authentication URL with the dynamic path
    const otpauthUrl = `otpauth://totp/${dynamicPath}?secret=${this.twoFactorSecret}&issuer=YourApp`;
    const qrCodeData = await qrcode.toDataURL(otpauthUrl);
    return qrCodeData;
  }
};

// Method to verify 2FA token
schema.methods.verify2FAToken = function (otp: string) {
  return speakeasy.totp.verify({
    secret: this.twoFactorSecret,
    encoding: "base32",
    token: otp,
    window: 1, // Tolerance for time sync issues (default: 0)
  });
};

export const User = mongoose.model("User", schema);
