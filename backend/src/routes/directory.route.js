import { Router } from "express";
import { fetchDirec } from "../controllers/directory.controller.js";

const router = Router();

router.route("/").get(fetchDirec);

export default router;
