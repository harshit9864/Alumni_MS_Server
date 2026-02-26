import { Router } from "express";
import { requireAuth } from "@clerk/express";
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
import { createOrder, verifyPayment } from "../controllers/donate.controller.js";

const router = Router();
router.route("/sync").get(requireAuth(), saveAndFetch);
router
  .route("/post-blog")
  .post(requireAuth(), upload.single("image"), postBlog);
router.route("/blogs").get(requireAuth(), fetchBlogs);
router.route("/join-event").post(requireAuth(), joinEvent);
router.route("/mentorships").get(requireAuth(), fetchMentorships);
router.route("/mentorships/:id").patch(requireAuth(), updateStatus);
router.route("/mentorships/end/:id").patch(endMentorship);
router.route("/fetchEvents").get(requireAuth(), fetchEvent);
router.route("/edit-blog/:id").patch(editBlog);
router.route("/delete-blog/:id").delete(deleteBlog);
router.route("/create-order").post(createOrder);
router.route("/create-order").post(createOrder);
router.route("/verify-order").post(requireAuth(),verifyPayment);


export default router;
