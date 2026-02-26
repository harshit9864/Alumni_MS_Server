import express from "express";
import { handleMessages } from "../controllers/message.controller.js";
import { requireAuth } from "@clerk/express";
const router = express.Router();

// Fetch chat history
router.route("/:peerUserId").get(requireAuth(), handleMessages);

export default router;
