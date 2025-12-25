import { Router } from "express";
import { clerkMiddleware } from "@clerk/express";
import { fetchEvent } from "../controllers/event.controller.js";

const router = Router();

router.route("/").get(clerkMiddleware(), fetchEvent);

export default router;
