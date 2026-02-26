import { Router } from "express";
import { requireAuth } from "@clerk/express";
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
router.route("/addAlumni").post(requireAuth(), addAlumni);
router.route("/postEvent").post(requireAuth(), postEvent);
router.route("/totalAlumni").get(requireAuth(), totalAlumni);
router.route("/direc").get(requireAuth(), fetchDirec);
router.route("/addAdmin").post(requireAuth(), addAdmin);
router.route("/edit-alumni/:id").patch(editAlumni);
router.route("/delete-alumni/:id").delete(deleteAlumni);
router.route("/delete-event/:id").delete(deleteEvent);
router.route("/edit-event/:id").patch(editEvent);

export default router;
