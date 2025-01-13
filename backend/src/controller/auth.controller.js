import User from "../modules/user.module.js";
import bcrypt from "bcryptjs";
import { createToken } from "../lib/token.js";
import cloudinary from "../lib/cloudinary.js";
import multer from "multer";

// Configure multer for file uploads
const storage = multer.memoryStorage(); // Store files in memory
const upload = multer({ storage: storage }).single("profilePic"); // 'profilePic' is the form input name

const signup = async (req, res) => {
  const { fullName, email, password } = req.body;

  try {
    if (!fullName || !email || !password) {
      return res.status(400).json({
        message: "Invalid Credential",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password should contain at least 6 characters",
      });
    }

    const user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({
        message: "User with this email already exists",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      fullName,
      email,
      password: hashPassword,
    });

    await newUser.save();

    req.user = user;

    // Generate JWT token
    createToken(newUser._id, res);

    return res.status(201).json({
      _id: newUser._id,
      fullName: newUser.fullName,
      email: newUser.email,
      profilePic: newUser.profilePic,
    });
  } catch (error) {
    console.log("Error in signup controller", error.message);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({
        message: "Invalid Credential",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    const correctPassword = await bcrypt.compare(password, user.password);

    if (!correctPassword) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    req.user = user;
    // Generate JWT Token
    createToken(user._id, res);
    return res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic || null,
    });
  } catch (error) {
    console.log("Error in login controller", error.message);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

const logout = async (req, res) => {
  try {
    res.cookie("jwt", "", {
      maxAge: 0,
    });
    res.status(200).json({
      message: "Logged out successfully",
    });
  } catch (error) {
    console.log("Error in logout controller", error.message);
    res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    // Use multer to handle the file upload before processing the request
    upload(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ message: "Error with file upload" });
      }

      const { profilePic, fullName } = req.body;
      const userId = req.user._id;

      let updatedUser = {};

      // If a profile picture is uploaded, upload it to Cloudinary
      if (req.file) {
        try {
          const uploadResponse = await new Promise((resolve, reject) => {
            cloudinary.uploader
              .upload_stream({ resource_type: "auto" }, (error, result) => {
                if (error) {
                  reject(new Error("Error uploading to Cloudinary"));
                } else {
                  resolve(result.secure_url);
                }
              })
              .end(req.file.buffer); // Ensure we stream the file buffer to Cloudinary
          });
          updatedUser.profilePic = uploadResponse; // Save Cloudinary URL
        } catch (error) {
          return res.status(500).json({ message: error.message });
        }
      }

      // If fullName is provided, update the user's fullName
      if (fullName) {
        updatedUser.fullName = fullName;
      }

      // If no changes are made, return an error
      if (!updatedUser.profilePic && !updatedUser.fullName) {
        return res.status(400).json({ message: "No changes made" });
      }

      // Update user profile
      const updatedUserData = await User.findByIdAndUpdate(
        userId,
        updatedUser,
        { new: true }
      );

      if (!updatedUserData) {
        return res
          .status(400)
          .json({ message: "User not found or no changes made" });
      }

      // Return the updated user
      return res.status(200).json(updatedUserData);
    });
  } catch (error) {
    console.log("Error in update profile:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const checkAuth = (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    console.log("Error in checkAuth controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export { signup, login, logout, updateProfile, checkAuth };
