import { Router } from "express";
import { clerkMiddleware } from "@clerk/express";
import {
  addAdmin,
  addAlumni,
  deleteAlumni,
  deleteEvent,
  editAlumni,
  editEvent,
  fetchDirec,
  postEvent,
  totalAlumni,
} from "../controllers/admin.controller.js";

const router = Router();

// router.post("/addAlumni", addAlumni); OR
router.route("/addAlumni").post(clerkMiddleware(), addAlumni);
router.route("/postEvent").post(clerkMiddleware(), postEvent);
router.route("/totalAlumni").get(clerkMiddleware(), totalAlumni);
router.route("/direc").get(clerkMiddleware(), fetchDirec);
router.route("/addAdmin").post(clerkMiddleware(), addAdmin);
router.route("/edit-alumni/:id").patch(editAlumni);
router.route("/delete-alumni/:id").delete(deleteAlumni);
router.route("/delete-event/:id").delete(deleteEvent);
router.route("/edit-event/:id").patch(editEvent);

export default router;
