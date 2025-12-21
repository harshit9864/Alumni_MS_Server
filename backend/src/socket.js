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

  io.use(async (socket, next) => {
    try {
      const { clerkId } = socket.handshake.auth;
      if (!clerkId) return next(new Error("Unauthorized"));

      const user = await User.findOne({ clerkId });
      if (!user) return next(new Error("User not found"));

      socket.userId = user._id.toString();
      socket.join(socket.userId); // personal room
      next();
    } catch (err) {
      next(err);
    }
  });

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.userId);

    socket.on("send_message", async ({ toUserId, text }) => {
      const conversationId = [socket.userId, toUserId].sort().join("_");

      const message = await Message.create({
        sender: socket.userId,
        receiver: toUserId,
        text,
        conversationId,
      });

      // Send to receiver if online
      io.to(toUserId).emit("receive_message", {
        _id: message._id,
        sender: socket.userId,
        receiver: toUserId,
        text,
        createdAt: message.createdAt,
      });

      // Send back to sender (confirmation)
      socket.emit("message_sent", message);
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.userId);
    });
  });

  return io;
};
