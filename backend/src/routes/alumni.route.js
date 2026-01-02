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
  endMentorship,
  editBlog,
  deleteBlog,
} from "../controllers/alumni.controller.js";
import { upload } from "../middlewares/multer.js";

const router = Router();
router.route("/sync").get(clerkMiddleware(), saveAndFetch);
router
  .route("/post-blog")
  .post(clerkMiddleware(), upload.single("image"), postBlog);
router.route("/blogs").get(clerkMiddleware(), fetchBlogs);
router.route("/join-event").post(clerkMiddleware(), joinEvent);
router.route("/mentorships").get(clerkMiddleware(), fetchMentorships);
router.route("/mentorships/:id").patch(clerkMiddleware(), updateStatus);
router.route("/mentorships/end/:id").patch(endMentorship);
router.route("/fetchEvents").get(clerkMiddleware(), fetchEvent);
router.route("/edit-blog/:id").patch(editBlog);
router.route("/delete-blog/:id").delete(deleteBlog);

export default router;
