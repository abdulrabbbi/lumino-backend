import express from "express";
import { handleParentCoach } from "../Controllers/parentCoachController.js";

const router = express.Router();

router.post("/ask", handleParentCoach);

export default router;
