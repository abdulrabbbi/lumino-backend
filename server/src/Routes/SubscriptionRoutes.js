import { getAllSubscriptions } from "../Controllers/SubscriptionController.js";
import express from 'express'

const router = express.Router();
router.get('/get-all-subscriptions', getAllSubscriptions);
export default router