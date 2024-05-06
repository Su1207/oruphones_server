import jwt from "jsonwebtoken";
import { UserTypes } from "../types/type.js";
import dotenv from "dotenv";
dotenv.config();

const secret = process.env.JWT_SECRET; // Replace with a strong secret key

const createJWT = (user: UserTypes, device: string) => {
  const payload = {
    userId: user._id,
    email: user.email,
    username: user.username,
    role: user.role,
    device: device,
  };
  return jwt.sign(payload, secret, { expiresIn: "1h" });
};

const verifyJWT = (token: string) => {
  return jwt.verify(token, secret);
};

export { createJWT, verifyJWT };
