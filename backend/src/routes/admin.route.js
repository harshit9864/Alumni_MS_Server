import { Router } from "express";
import { addAlumni, postEvent } from "../controllers/admin.controller.js";

const router = Router();

router.get("/", (req, res) => {
  res.send("Server is running");
});

// router.post("/addAlumni", addAlumni); OR
router.route("/addAlumni").post(addAlumni);
router.route("/postEvent").post(postEvent);

export default router;
