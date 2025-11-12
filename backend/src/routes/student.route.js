import { clerkMiddleware } from "@clerk/express";
import { Router } from "express";
import {
  addMentorship,
  addstudent,
  fetchMentorships,
} from "../controllers/student.controller.js";

const router = Router();

router.route("/form").post(clerkMiddleware(), addstudent);
router.route("/mentorship").post(clerkMiddleware(), addMentorship);
router.route("/profile").get(clerkMiddleware(), fetchMentorships);
export default router;
