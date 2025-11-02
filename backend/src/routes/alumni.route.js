import { Router } from "express";
import { clerkMiddleware } from '@clerk/express'
import { postBlog, saveAndFetch } from "../controllers/alumni.controller.js";

const router = Router();
router.route("/sync").get(clerkMiddleware(),saveAndFetch)
router.route("/post-blog").post(postBlog)

export default router