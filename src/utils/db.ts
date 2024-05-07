import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const connectDB = async () => {
  try {
    const uri: string = process.env.MONGODB_URI; // Replace with your connection string
    if (uri) {
      await mongoose.connect(uri);
      console.log("MongoDB connected successfully");
    }
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  }
};

export default connectDB;
