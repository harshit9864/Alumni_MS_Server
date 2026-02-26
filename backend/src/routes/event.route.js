import { Router } from "express";
import { requireAuth } from "@clerk/express";
import { fetchEvent } from "../controllers/event.controller.js";

const router = Router();

router.route("/").get(requireAuth(), fetchEvent);

export default router;
