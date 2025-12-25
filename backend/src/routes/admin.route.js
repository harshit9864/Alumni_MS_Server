import { Router } from "express";
import { clerkMiddleware } from "@clerk/express";
import {
  addAdmin,
  addAlumni,
  fetchDirec,
  postEvent,
  totalAlumni,
} from "../controllers/admin.controller.js";

const router = Router();

router.get("/", (req, res) => {
  res.send("Server is running");
});

// router.post("/addAlumni", addAlumni); OR
router.route("/addAlumni").post(clerkMiddleware(), addAlumni);
router.route("/postEvent").post(clerkMiddleware(), postEvent);
router.route("/totalAlumni").get(clerkMiddleware(), totalAlumni);
router.route("/direc").get(clerkMiddleware(), fetchDirec);
router.route("/addAdmin").post(clerkMiddleware(), addAdmin);

export default router;
