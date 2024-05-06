import express from "express";
import {
  fetchActivities,
  logoutActivity,
  otpVerification,
  passwordChangeEmailVerify,
  passwordChangeOtpVerify,
  register,
  requestQRCode,
} from "../controllers/user.js";
import {
  checkBlockedIP,
  deviceInfo,
  isAuth,
  newUserValidator,
  removeExpiredBlockedIPs,
} from "../middleware/validator.js";

const router = express.Router();

router.post("/register", newUserValidator, register);
router.post(
  "/sigin",
  newUserValidator,
  checkBlockedIP,
  removeExpiredBlockedIPs,
  requestQRCode
);
router.post(
  "/otp-verification",
  deviceInfo,
  checkBlockedIP,
  removeExpiredBlockedIPs,
  otpVerification
);
router.get("/activities/:id", fetchActivities);
router.post("/logout", deviceInfo, logoutActivity);
router.post(
  "/emailVerify",
  newUserValidator,
  checkBlockedIP,
  removeExpiredBlockedIPs,
  passwordChangeEmailVerify
);
router.post(
  "/otpVerify",
  checkBlockedIP,
  removeExpiredBlockedIPs,
  passwordChangeOtpVerify
);

export default router;
