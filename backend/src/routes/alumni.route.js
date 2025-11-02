import { Router } from "express";
import { clerkMiddleware } from "@clerk/express";
import { postBlog, saveAndFetch,fetchBlogs } from "../controllers/alumni.controller.js";

const router = Router();
router.route("/sync").get(clerkMiddleware(), saveAndFetch);
router.route("/post-blog").post(clerkMiddleware(), postBlog);
router.route("/blogs").get(clerkMiddleware(),fetchBlogs);

export default router;
