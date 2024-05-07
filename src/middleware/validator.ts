import { RequestHandler } from "express";
import { verifyJWT } from "../utils/jwt.js";
import { UserActivity } from "../models/userActivity.js";
import { User } from "../models/user.js";
import { FailedLoginAttempts } from "../models/failedLoginAttempt.js";
import { BlockedIP } from "../models/blockedIP.js";

declare global {
  namespace Express {
    interface Request {
      user: {
        [key: string]: any;
      };
      device?: string; // Define the device property as optional
    }
  }
}

export const newUserValidator: RequestHandler = async (req, res, next) => {
  const emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;

  const { email } = req.body;
  if (!emailRegex.test(email)) {
    return res.status(401).json({ error: "Inavlid email" });
  }

  next();
};

export const isAuth: RequestHandler = async (req, res, next) => {
  try {
    const authorizationToken = req.cookies?.token;
    if (!authorizationToken)
      return res.status(403).json({ error: "unauthorized access!" });

    const payload = verifyJWT(authorizationToken) as { userId: string };

    const user = await User.findById(payload.userId);
    if (!user) return res.status(403).json({ error: "unauthorized user!" });

    req.user = user;

    next();
  } catch (error) {
    res.status(500).json({ error: "Something went wrong!" });
  }
};

export const isAdmin: RequestHandler = async (req, res, next) => {
  if (req.user.role === "admin") next();
  else res.status(403).json({ error: "Protected only for admin!" });
};

export const deviceInfo: RequestHandler = async (req, res, next) => {
  try {
    const browser = req.useragent.browser;
    const platform = req.useragent.platform;

    let deviceInfo = "";

    if (req.useragent.isAndroid) {
      deviceInfo = "Android";
    } else if (req.useragent.isiPhone) {
      deviceInfo = "IPhone";
    } else if (req.useragent.isTablet) {
      deviceInfo = "Tablet";
    } else if (req.useragent.isiPad) {
      deviceInfo = "IPad";
    } else if (req.useragent.isDesktop) {
      deviceInfo = "PC";
    }

    req.device = `${deviceInfo} ${browser} - ${platform}`;

    next();
  } catch (err) {
    res.status(500).json(err);
  }
};

// function to handle failed login attempts
export const handleFailedLogin = async (ip: string) => {
  try {
    // Find failed login attempt record for the IP
    let attempt = await FailedLoginAttempts.findOne({ ip });

    if (!attempt) {
      attempt = new FailedLoginAttempts({ ip });
    }

    // Increment failed login attempts count
    attempt.attempts++;
    attempt.lastAttemptAt = Date.now();

    await attempt.save();

    // Check if the IP should be blocked
    const MAX_ATTEMPTS = 5; // Maximum allowed failed login attempts
    const BLOCK_DURATION_MS = 10 * 60 * 1000; // Block duration in milliseconds (e.g., 10 minutes)

    if (attempt.attempts >= MAX_ATTEMPTS) {
      // Block the IP
      const existingBlock = await BlockedIP.findOne({ ip });

      if (!existingBlock) {
        // If IP is not already blocked, create a new block record
        const block = new BlockedIP({
          ip,
          expiresAt: Date.now() + BLOCK_DURATION_MS,
        });
        await block.save();
      }
    }
  } catch (error) {
    console.error("Error handling failed login:", error);
  }
};

// Middleware to check if IP is blocked
export const checkBlockedIP: RequestHandler = async (req, res, next) => {
  const ip = req.ip; // Get client's IP address

  try {
    // Check if the IP is blocked
    const blockedIP = await BlockedIP.findOne({ ip });

    if (blockedIP && blockedIP.expiresAt > Date.now()) {
      // IP is blocked
      return res.status(403).send("IP is blocked");
    }

    next();
  } catch (error) {
    console.error("Error checking blocked IP:", error);
    next(error);
  }
};

export const handleSuccessfulLogin = async (ip: string) => {
  try {
    // Find and reset the failed login attempt record for the IP
    await FailedLoginAttempts.findOneAndUpdate(
      { ip },
      { $set: { attempts: 0 } }
    );
  } catch (error) {
    console.error("Error handling successful login:", error);
  }
};

export const removeExpiredBlockedIPs: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    // Remove blocked IPs with expiration time less than the current time
    await BlockedIP.deleteMany({ expiresAt: { $lt: Date.now() } });

    next();
  } catch (error) {
    console.error("Error removing expired blocked IPs:", error);
    next(error);
  }
};
