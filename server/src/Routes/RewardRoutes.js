import { getTopContributors, getTopActivitiesLeaderboard } from "../Controllers/RewardController.js";
import { authenticate } from "../Middleware/Authenticate.js";
import express from "express";


const router = express.Router();
router.get('/get-top-contributors', getTopContributors);
router.get('/get-top-activities-leaderboard', getTopActivitiesLeaderboard);

export default router