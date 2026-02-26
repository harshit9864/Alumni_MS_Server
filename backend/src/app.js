import express from "express";
import cors from "cors";
import { clerkMiddleware } from "@clerk/express";
import adminRouter from "./routes/admin.route.js";
import eventRouter from "./routes/event.route.js";
import alumniRouter from "./routes/alumni.route.js";
import studentRouter from "./routes/student.route.js";
import messageRouter from "./routes/messages.route.js";

const app = express();
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true,
}));
app.use(express.json());
app.use(express.static("public"));

// Allow 15 seconds of clock skew to handle slight time differences
// between this server and Clerk's servers
app.use(clerkMiddleware({ clockSkewInMs: 15000 }));

app.use("/api", adminRouter);
app.use("/events", eventRouter);
app.use("/alumni", alumniRouter);
app.use("/student", studentRouter);
app.use("/api/messages", messageRouter);

app.use((err, req, res, next) => {
  console.error("Error caught by middleware:", err);

  // Fallbacks if custom error doesn't have a status/message
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  // Always return JSON, never HTML
  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});

export { app };
