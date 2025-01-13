import Message from "../modules/message.module.js";
import User from "../modules/user.module.js";
import multer from "multer";
import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

// Setup multer storage
const storage = multer.memoryStorage();
const upload = multer({ storage: storage }).single("image");

// Helper function to handle image upload
const uploadImage = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const uploadResponse = cloudinary.uploader.upload_stream(
      { resource_type: "auto" },
      (error, result) => {
        if (error) reject(error);
        resolve(result);
      }
    );

    uploadResponse.end(fileBuffer);
  });
};

const getUsers = async (req, res) => {
  try {
    const loggedInUser = req.user._id;
    const filteredUsers = await User.find({
      _id: { $ne: loggedInUser },
    }).select("-password");
    res.status(200).json(filteredUsers);
  } catch (error) {
    console.log("Error in getUsers controller", error.message);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    const filteredMessages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    });

    res.status(200).json(filteredMessages);
  } catch (error) {
    console.log("Error in getMessages controller", error.message);
    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

const sendMessage = async (req, res) => {
  try {
    const { id: receiverId } = req.params;
    const senderId = req.user._id; // Assuming user is authenticated and you get senderId

    // Use multer to handle the incoming form-data
    upload(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ message: "Error while uploading file" });
      }

      const { text } = req.body;
      let imageUrl = null;

      if (req.file) {
        try {
          // Upload image to Cloudinary using the helper function
          const uploadResponse = await uploadImage(req.file.buffer);
          imageUrl = uploadResponse.secure_url; // Use the image URL returned from Cloudinary
        } catch (error) {
          console.error("Cloudinary upload error:", error);
          return res
            .status(500)
            .json({ message: "Error uploading to Cloudinary" });
        }
      }

      // Create and save the message
      const message = new Message({
        senderId,
        receiverId,
        text,
        image: imageUrl,
      });

      await message.save();

      const receiverSocketId = getReceiverSocketId(receiverId);

      if (receiverSocketId) {
        io.to(receiverSocketId).emit("newMessage", message);
      }

      res.status(200).json(message);
    });
  } catch (error) {
    console.log("Error in sendMessage controller:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export { getUsers, getMessages, sendMessage };
