import express from "express";
import { handleMessages } from "../controllers/message.controller.js";
import { clerkMiddleware } from "@clerk/express";
const router = express.Router();

// Fetch chat history
router.route("/:peerUserId").get(clerkMiddleware(), handleMessages);

export default router;
