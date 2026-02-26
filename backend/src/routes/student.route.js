import { requireAuth } from "@clerk/express";
import { Router } from "express";
import {
  addMentorship,
  addstudent,
  fetchBlogs,
  fetchMentorships,
} from "../controllers/student.controller.js";

const router = Router();

router.route("/form").post(requireAuth(), addstudent);
router.route("/mentorship").post(requireAuth(), addMentorship);
router.route("/profile").get(requireAuth(), fetchMentorships);
router.route("/blogs").get(requireAuth(), fetchBlogs);
export default router;
