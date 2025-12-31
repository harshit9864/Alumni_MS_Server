import { Server } from "socket.io";
import { Message } from "./models/message.model.js";
import { User } from "./models/user.model.js";

export const initSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:3000",
      credentials: true,
    },
  });

  // Store active connections: { userId, socketId }
  let onlineUsers = [];

  // Middleware: Authentication & Room Joining
  io.use(async (socket, next) => {
    try {
      const { clerkId } = socket.handshake.auth;
      if (!clerkId) return next(new Error("Unauthorized"));

      const user = await User.findOne({ clerkId });
      if (!user) return next(new Error("User not found"));

      socket.userId = user._id.toString();
      socket.join(socket.userId); // Join personal room for 1-on-1 messages
      next();
    } catch (err) {
      next(err);
    }
  });

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.userId);

    // 🟢 1. ADD USER TO ONLINE LIST
    // We push every connection. If a user has 2 tabs open, they will be in the list twice.
    // This ensures they stay "Online" until the last tab is closed.
    onlineUsers.push({
      userId: socket.userId,
      socketId: socket.id,
    });

    // 🟢 2. BROADCAST ONLINE LIST TO EVERYONE
    io.emit("get_online_users", onlineUsers);

    // 📩 Handle Message Sending
    socket.on("send_message", async ({ toUserId, text }) => {
      const conversationId = [socket.userId, toUserId].sort().join("_");

      const message = await Message.create({
        sender: socket.userId,
        receiver: toUserId,
        text,
        conversationId,
      });

      // Send to receiver (if they are in their room)
      io.to(toUserId).emit("receive_message", {
        _id: message._id,
        sender: socket.userId,
        receiver: toUserId,
        text,
        createdAt: message.createdAt,
      });

      // Send confirmation back to sender
      socket.emit("message_sent", message);
    });

    // 🔴 3. HANDLE DISCONNECT
    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.userId);

      // Remove ONLY this specific socket connection
      onlineUsers = onlineUsers.filter((user) => user.socketId !== socket.id);

      // Broadcast the updated list
      io.emit("get_online_users", onlineUsers);
    });
  });

  return io;
};