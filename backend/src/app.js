import express from "express";
import cors from "cors";
import router from "./routes/admin.route.js";
import eventRouter from "./routes/event.route.js";


const app = express();
app.use(cors());
app.use(express.json());

app.use("/api", router);
app.use("/events", eventRouter);


app.use((err, req, res, next) => {
  console.error("Error caught by middleware:", err);

  // Fallbacks if custom error doesn’t have a status/message
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
