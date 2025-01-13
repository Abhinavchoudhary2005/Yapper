import mongoose from "mongoose"
import dotenv from "dotenv"

dotenv.config();

const connectDB = async () =>{
    const uri = process.env.MONGODB_URL;

    if (!uri) {
        throw new Error("MONGODB_URL is not defined in the environment variables.");
      }

    try {
        await mongoose.connect(uri);
        console.log("MongoDB connected...");
      } catch (error) {
        console.error("MongoDB connection error:", error);
      }
}

export { connectDB }