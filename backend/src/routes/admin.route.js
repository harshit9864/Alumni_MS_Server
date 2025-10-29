import { Router } from "express";
import {
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
router.route("/addAlumni").post(addAlumni);
router.route("/postEvent").post(postEvent);
router.route("/totalAlumni").get(totalAlumni);
router.route("/direc").get(fetchDirec);

export default router;
