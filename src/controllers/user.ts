import { Request, RequestHandler, Response } from "express";
import { User } from "../models/user.js";
// import { UserTypes } from "../types/type.js";
import { createJWT } from "../utils/jwt.js";
import { UserActivity } from "../models/userActivity.js";
import {
  handleFailedLogin,
  handleSuccessfulLogin,
} from "../middleware/validator.js";
import { sendEmail } from "../utils/sentEmail.js";
// import useragent from "express-useragent";

export const register: RequestHandler = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const existingEmail = await User.findOne({ email });

    if (existingEmail) {
      return res.status(401).json({ error: "Email already exist" });
    }

    // Create a new user instance
    const user = new User({
      username,
      password,
      email,
    });

    // Set up 2FA secret key
    user.setup2FASecret();

    // Save the user to the database
    await user.save();

    res.status(200).json({
      success: true,
    });
  } catch (err) {
    res.status(500).json(err);
  }
};

export const requestQRCode: RequestHandler = async (req, res, next) => {
  const { email, password } = req.body;
  const ip = req.ip;

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ error: "User not found!" });

  const isMatched = await user.comparePassword(password);
  if (!isMatched) {
    handleFailedLogin(ip);
    return res.status(403).json({ error: "Email/Password doesn't match!" });
  }

  const qrcode = await user.generateQRCode();
  handleSuccessfulLogin(ip);

  //   console.log("headers: ", req.headers);

  //   user is there and password is cool
  res.status(200).json({
    qrcode,
    email,
  });
};

export const otpVerification = async (req: Request, res: Response) => {
  try {
    const { otp, email } = req.body;
    const ip = req.ip;

    const user = await User.findOne({ email });

    const verified = user.verify2FAToken(otp);

    if (!verified) {
      handleFailedLogin(ip);
      return res.status(402).json({ error: "Otp doesn't matched" });
    }

    const timestamp = Date.now();

    handleSuccessfulLogin(ip);

    const device = req.device;

    sendEmail(email);

    const newActivity = new UserActivity({
      user: user._id,
      type: "login",
      timestamp,
      device,
    });

    if (user) {
      const token = createJWT(user, device);

      if (token) {
        user.activeSession.push({
          deviceId: device,
          timestamp,
          token,
        });

        // Save the updated user document
        await Promise.all([user.save(), newActivity.save()]);
        res.cookie("token", token); // Set cookie with path, secure, and httpOnly flags

        user.password = undefined;
        user.twoFactorSecret = undefined;

        res.status(200).json({
          success: true,
          token,
          user,
        });
      }
    }
  } catch (err) {
    res.status(500).json(err);
  }
};

export const passwordChangeEmailVerify: RequestHandler = async (req, res) => {
  try {
    const { email } = req.body;
    const ip = req.ip;

    const user = await User.findOne({ email });
    if (!user) {
      handleFailedLogin(ip);

      return res.status(401).json({ error: "Invalid email" });
    }

    const qrcode = await user.generateQRCode();
    handleSuccessfulLogin(ip);
    res.status(200).json({
      qrcode,
      email,
    });
  } catch (err) {
    res.status(500).json(err);
  }
};

export const passwordChangeOtpVerify: RequestHandler = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const ip = req.ip;

    const user = await User.findOne({ email });

    const verified = user.verify2FAToken(otp);

    if (!verified) {
      handleFailedLogin(ip);
      return res.status(402).json({ error: "Otp doesn't macthed" });
    }
    if (!user) {
      handleFailedLogin(ip);
      return res.status(401).json({ error: "Invalid email" });
    }

    user.password = newPassword;

    await user.save();

    handleSuccessfulLogin(ip);
    res.status(200).json({
      success: true,
    });
  } catch (err) {
    res.status(500).json(err);
  }
};

export const fetchActivities: RequestHandler = async (req, res) => {
  try {
    const userId: string = req.params.id;
    const user = await User.findById(userId);

    const userActivity = await UserActivity.find({ user: userId });

    if (!user) {
      return res.status(401).json({ error: "No user found" });
    }
    if (userActivity.length <= 0) {
      return res.status(401).json({ error: "No user activity found" });
    }

    const activeSession = user.activeSession;

    res.status(200).json({
      userActivity,
      activeSession,
    });
  } catch (err) {
    res.status(500).json(err);
  }
};

export const logoutActivity: RequestHandler = async (req, res) => {
  try {
    const { userId } = req.body;

    const device = req.device;

    const user = await User.findById(userId);

    if (user) {
      user.activeSession = user.activeSession.filter(
        (session) => session.deviceId !== device
      );

      const timestamp = Date.now();

      const loginActivities = await UserActivity.find({
        user: user._id,
        device: device,
      });

      const index = loginActivities.findIndex(
        (activity) => activity.type === "login"
      );

      if (index !== -1) {
        loginActivities[index].timestamp = timestamp;
        loginActivities[index].type = "logout";
      }

      await Promise.all([user.save(), loginActivities[index].save()]);

      // Clear the token cookie
      res.clearCookie("token");
      res.send({ message: "Logged out successfully" });
    }
  } catch (err) {
    res.status(500).json(err);
  }
};
