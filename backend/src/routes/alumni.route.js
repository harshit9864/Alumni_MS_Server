import { Router } from "express";
import { clerkMiddleware } from "@clerk/express";
import {
  postBlog,
  saveAndFetch,
  fetchBlogs,
  joinEvent,
  fetchMentorships,
  updateStatus,
  fetchEvent,
} from "../controllers/alumni.controller.js";

const router = Router();
router.route("/sync").get(clerkMiddleware(), saveAndFetch);
router.route("/post-blog").post(clerkMiddleware(), postBlog);
router.route("/blogs").get(clerkMiddleware(), fetchBlogs);
router.route("/join-event").post(clerkMiddleware(), joinEvent);
router.route("/mentorships").get(clerkMiddleware(), fetchMentorships);
router.route("/mentorships/:id/status").patch(clerkMiddleware(), updateStatus);
router.route("/fetchEvents").get(clerkMiddleware(),fetchEvent)

export default router;
