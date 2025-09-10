import { getTopContributors } from "../Controllers/RewardController.js";
import { authenticate } from "../Middleware/Authenticate.js";
import express from "express";


const router = express.Router();
router.get('/get-top-contributors', getTopContributors);

export default router