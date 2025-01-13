import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import { connectDB } from "./lib/db.js";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import { app, server } from "./lib/socket.js";

dotenv.config();

//PORT
const PORT = process.env.PORT || 5001;

//DATABASE
connectDB();

// MIDDLEWARE
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

//ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/message", messageRoutes);

// START THE SERVER
server.listen(PORT, () => {
  console.log(`Server started at Port: ${PORT}`);
});

export default app;
