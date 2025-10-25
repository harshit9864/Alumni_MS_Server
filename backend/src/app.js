import express from "express";
import cors from "cors";
import router from "./routes/admin.route.js";
import eventRouter from "./routes/event.route.js";
import dirRouter from "./routes/directory.route.js";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api", router);
app.use("/events", eventRouter);
app.use("/direc", dirRouter);

export { app };
