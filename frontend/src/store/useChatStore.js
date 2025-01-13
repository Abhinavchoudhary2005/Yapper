import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  receiverUser: JSON.parse(localStorage.getItem("receiverUser")) || null, // Load from localStorage
  setreceiverUser: (user) => {
    localStorage.setItem("receiverUser", JSON.stringify(user)); // Save to localStorage
    set({ receiverUser: user });
    get().getMessages(user._id); // Fetch messages when a new user is selected
  },
  messages: [],
  users: [],
  loadingUsers: false,

  // Fetch the list of users
  getUsers: async () => {
    try {
      set({ loadingUsers: true });
      const res = await axiosInstance.get("/message/users");
      set({ users: res.data });
    } catch (error) {
      console.log("Error in getUsers:", error);
      set({ users: [] });
      toast.error(error?.response?.data?.message || "Internal Server Error");
    } finally {
      set({ loadingUsers: false });
    }
  },

  // Fetch messages for a specific user
  getMessages: async (id) => {
    try {
      const res = await axiosInstance.get(`/message/${id}`);
      set({ messages: res.data });
    } catch (error) {
      console.log("Error in getMessages:", error);
      set({ messages: [] });
      toast.error(error?.response?.data?.message || "Internal Server Error");
    }
  },

  // Send a new message to the receiver
  sendMessage: async (data) => {
    try {
      const { messages } = get();
      const receiverId = get().receiverUser?._id;
      const res = await axiosInstance.post(
        `/message/send/${receiverId}`,
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data", // Important for file uploads
          },
        }
      );
      set({ messages: [...messages, res.data] });
    } catch (error) {
      console.log("Error in sendMessage:", error);
      toast.error(error?.response?.data?.message || "Internal Server Error");
    }
  },

  // Subscribe to real-time message updates via socket
  subscribeToMessages: async () => {
    const { receiverUser } = get();
    if (!receiverUser) return;

    const socket = useAuthStore.getState().socket;
    if (socket) {
      socket.on("newMessage", (newMessage) => {
        const isMessageSentFromSelectedUser =
          newMessage.senderId === receiverUser._id;
        if (!isMessageSentFromSelectedUser) return;

        set({ messages: [...get().messages, newMessage] });
      });
    }
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (socket) {
      socket.off("newMessage");
    }
  },
}));
