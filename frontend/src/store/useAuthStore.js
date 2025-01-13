import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const BASE_URL = import.meta.env.VITE_BASE_API_URL;

export const useAuthStore = create((set, get) => ({
  authUser: JSON.parse(localStorage.getItem("authUser")) || null, // Initialize from localStorage
  socket: null,
  setAuthUser: (user) => {
    set({ authUser: user });
    if (user) {
      localStorage.setItem("authUser", JSON.stringify(user)); // Save to localStorage
    } else {
      localStorage.removeItem("authUser"); // Remove from localStorage if user is null
    }
  },

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");
      set({ authUser: res.data });
      localStorage.setItem("authUser", JSON.stringify(res.data)); // Save to localStorage
      get().connectSocket();
    } catch (error) {
      console.log("Error in checkAuth:", error);
      set({ authUser: null });
      localStorage.removeItem("authUser"); // Clear from localStorage on error
    }
  },

  signUp: async (data) => {
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      set({ authUser: res.data });
      localStorage.setItem("authUser", JSON.stringify(res.data)); // Save to localStorage
      toast.success("Account created successfully");
      get().connectSocket();

      const token = res.data.token;
      localStorage.setItem("jwt", token);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Signup failed");
    }
  },

  login: async (data) => {
    try {
      const res = await axiosInstance.post("/auth/login", data);
      set({ authUser: res.data });
      localStorage.setItem("authUser", JSON.stringify(res.data)); // Save to localStorage
      toast.success("Logged in successfully");
      get().connectSocket();

      const token = res.data.token; // Assuming the token is returned in the response
      localStorage.setItem("jwt", token);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Login failed");
      console.log(error);
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null });
      localStorage.removeItem("authUser");
      localStorage.removeItem("receiverUser");
      localStorage.removeItem("jwt");
      toast.success("Logged out successfully");
      get().disconnectSocket();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Logout failed");
    }
  },

  updateProfile: async (name, profilePhoto, onComplete) => {
    const { authUser } = get();
    const formData = new FormData();
    formData.append("fullName", name);
    if (profilePhoto) formData.append("profilePic", profilePhoto);

    try {
      const response = await axiosInstance.put(
        "/auth/update-profile",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (response?.data) {
        toast.success("Profile updated successfully!");
        set({
          authUser: {
            ...authUser,
            fullName: name,
            profilePic: response.data.profilePic || profilePhoto,
          },
        });
        localStorage.setItem(
          "authUser",
          JSON.stringify({
            ...authUser,
            fullName: name,
            profilePic: response.data.profilePic || profilePhoto,
          })
        );
        onComplete?.(true);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile.");
      onComplete?.(false);
    }
  },

  connectSocket: async () => {
    const { authUser, socket } = get(); // Retrieve authUser and socket from state

    if (!authUser || (socket && socket.connected)) return; // Ensure authUser exists and socket isn't already connected

    const newSocket = io(BASE_URL, {
      query: {
        userId: authUser._id, // Use the correct authUser reference
      },
    });

    newSocket.connect();

    set({ socket: newSocket }); // Update the socket in the state

    newSocket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds });
    });
  },

  disconnectSocket: () => {
    if (get().socket?.connected) get().socket.disconnect();
  },
}));
