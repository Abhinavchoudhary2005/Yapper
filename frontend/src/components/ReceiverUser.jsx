import React, { useState, useEffect, useRef } from "react";
import { Plus, X } from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import Message from "./Message.jsx";
import toast from "react-hot-toast";

const ReceiverUser = () => {
  const {
    receiverUser,
    messages,
    getMessages,
    sendMessage,
    subscribeToMessages,
    unsubscribeFromMessages,
  } = useChatStore();
  const { authUser, onlineUsers } = useAuthStore();
  const [text, setText] = useState(""); // State to manage message text
  const [image, setImage] = useState(null); // State for selected image
  const [loading, setLoading] = useState(false); // State to manage loading (sending message)
  const fileInputRef = useRef(); // Ref for the hidden file input

  useEffect(() => {
    getMessages(receiverUser._id);
    subscribeToMessages();

    return () => unsubscribeFromMessages();
  }, [
    receiverUser._id,
    getMessages,
    subscribeToMessages,
    unsubscribeFromMessages,
  ]);

  // Scroll to the bottom of the message list whenever messages change
  useEffect(() => {
    const messageContainer = document.getElementById("messages");
    messageContainer?.scrollTo(0, messageContainer.scrollHeight);
  }, [messages]);

  let lastSenderId = null;

  const handleSendMessage = async () => {
    if (!text.trim() && !image) {
      toast.error("Please enter a message or select an image!");
      return;
    }

    const formData = new FormData();
    formData.set("text", text);

    // If an image is selected, add it to FormData
    if (image) {
      formData.set("image", image);
    }

    setLoading(true); // Set loading state to true before sending

    try {
      await sendMessage(formData); // Send the formData through the sendMessage function
      setText(""); // Reset text input after sending
      setImage(null); // Clear selected image
    } catch (error) {
      toast.error("Error sending message, please try again!");
    } finally {
      setLoading(false); // Set loading state to false after sending
    }
  };

  const handleAttachmentClick = () => {
    if (image) {
      // Remove selected image when clicked again
      setImage(null);
    } else {
      // Open the file input if no image is selected
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("File size exceeds 2MB.");
        return;
      }
      if (!["image/jpeg", "image/png"].includes(file.type)) {
        toast.error(
          "Unsupported file format. Please upload a JPG or PNG image."
        );
        return;
      }
      setImage(file); // Set selected image to state
    }
  };

  const handleTextChange = (e) => {
    setText(e.target.value); // Directly update the text state
  };

  // Handle "Enter" key to trigger message send
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault(); // Prevent new line when pressing enter
      handleSendMessage(); // Trigger send message
    }
  };

  // Check if the receiverUser is online
  const isReceiverUserOnline = onlineUsers?.includes(receiverUser?._id);

  return (
    <div
      className="flex flex-col w-full"
      style={{ height: "calc(100vh - 4rem)" }}
    >
      {/* Receiver User Info */}
      <div className="flex items-center p-2.5 bg-base-200 shadow-md">
        <div className="relative avatar mr-4">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-content text-lg">
            {receiverUser?.profilePic ? (
              <img
                src={receiverUser.profilePic}
                alt={receiverUser.fullName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="h-full w-full flex justify-center items-center">
                {receiverUser?.fullName &&
                  receiverUser.fullName
                    .split(" ")
                    .map((word) => word[0].toUpperCase())
                    .join("")}
              </div>
            )}
          </div>

          {/* Green dot for online status */}
          {isReceiverUserOnline && (
            <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-white"></div>
          )}
        </div>
        <div>
          <h3 className="text-lg font-semibold">{receiverUser?.fullName}</h3>
          <p className="text-xs text-base-content/70">
            {isReceiverUserOnline ? "Online" : "Offline"}
          </p>
        </div>
      </div>

      {/* Messages Display */}
      <div
        id="messages"
        className="flex-1 overflow-y-auto space-y-0.5 p-3 bg-base-500"
        style={{ maxHeight: "calc(100vh - 9rem)" }}
      >
        {messages.length === 0 ? (
          <div className="flex justify-center items-center h-full">
            <p className="text-base-content/70">Start a conversation!</p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isAuthUser = authUser._id === msg.senderId;
            const showAvatar = msg.senderId !== lastSenderId; // Show avatar only if sender changes
            lastSenderId = msg.senderId;

            return (
              <Message
                key={msg._id}
                message={msg}
                isAuthUser={isAuthUser}
                profilePic={
                  isAuthUser ? authUser.profilePic : receiverUser?.profilePic
                }
                userName={
                  isAuthUser ? authUser.fullName : receiverUser?.fullName
                }
                showAvatar={showAvatar}
              />
            );
          })
        )}
      </div>

      {/* Image preview */}
      {image && (
        <div className="relative p-4 pl-14 pb-0 bg-base-200">
          <img
            src={URL.createObjectURL(image)} // Create a temporary URL for the image
            alt="Image preview"
            className="max-w-[200px] max-h-[200px] object-cover rounded-md"
          />
        </div>
      )}

      {/* Send Message Input Area */}
      <div className="p-4 bg-base-200 flex items-center">
        <button
          className="mr-2 p-2 rounded-full bg-base-300 hover:bg-base-400"
          onClick={handleAttachmentClick}
        >
          {image ? (
            <X className="text-lg text-base-content" />
          ) : (
            <Plus className="text-lg text-base-content" />
          )}
        </button>

        {/* Hidden file input */}
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleFileChange}
        />

        <input
          type="text"
          value={text}
          onChange={handleTextChange}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
          className="input input-bordered w-full"
        />

        <button
          className={`btn btn-primary ml-2 transition-transform ${
            loading ? "loading" : ""
          }`}
          onClick={handleSendMessage}
          disabled={loading} // Disable the button while sending
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ReceiverUser;
