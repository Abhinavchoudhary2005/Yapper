import React from "react";

// DaisyUI-based Message Component
const Message = ({ message, isAuthUser, profilePic, userName, showAvatar }) => {
  const getInitials = (name) => {
    if (!name) return "";
    return name
      .split(" ")
      .map((word) => word[0].toUpperCase())
      .join("");
  };

  return (
    <div
      className={`chat ${
        isAuthUser ? "chat-end" : "chat-start"
      } text-sm space-y-1`}
    >
      {/* Conditionally Render Avatar */}
      {showAvatar && (
        <div className="chat-image avatar">
          <div className="w-10 h-10 rounded-full">
            {profilePic ? (
              <img
                src={profilePic}
                alt={userName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="bg-primary text-primary-content w-full h-full flex items-center justify-center rounded-full text-sm font-bold">
                {getInitials(userName)}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Chat Bubble with Image and Text */}
      <div
        className={`chat-bubble text-sm bg-base-500 h-auto max-w-[80%] ${
          !showAvatar && !isAuthUser ? "ml-9" : ""
        } ${!showAvatar && isAuthUser ? "mr-9" : ""} ${
          isAuthUser ? "flex-row-reverse" : "flex-row"
        } break-words`} // Ensures text wraps and breaks correctly
        style={{ wordBreak: "break-word" }} // Apply word breaking for long words
      >
        {/* Display Image if Available */}
        {message.image && (
          <div className="">
            <img
              src={message.image}
              alt="message image"
              className="max-w-[150px] max-h-[150px] object-cover rounded-md pb-2"
            />
          </div>
        )}

        {/* Display Text */}
        {message.text && (
          <div
            className="text-base break-words"
            style={{ wordBreak: "break-word" }}
          >
            {message.text}
          </div>
        )}
      </div>
    </div>
  );
};

export default Message;
