import User from "../modules/user.module.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const protectRoute = async (req, res, next) => {
  try {
    // Get the token from the Authorization header
    const token = req.headers.authorization?.split(" ")[1]; // Format: "Bearer <token>"

    if (!token) {
      return res.status(401).json({
        message: "Unauthorized - No token provided",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded) {
      return res.status(401).json({
        message: "Unauthorized - Invalid token",
      });
    }

    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    req.user = user;

    next();
  } catch (error) {
    console.log("Error in protectRoute middleware:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export { protectRoute };
