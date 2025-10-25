import { Router } from "express";
import { fetchEvent } from "../controllers/event.controller.js";

const router = Router();

router.route("/").get(fetchEvent);

export default router;
