import { getAllSubscriptions, getSubscriptionStatus, cancelSubscription, purchaseSubscription, verifySubscription } from "../Controllers/SubscriptionController.js";
import express from 'express'
import { authenticate } from "../Middleware/Authenticate.js";

const router = express.Router();
router.get('/get-all-subscriptions', getAllSubscriptions);
router.post('/purchase-subscription', authenticate, purchaseSubscription);
router.post('/verify-subscription', authenticate, verifySubscription)
router.post('/cancel-subscription', authenticate, cancelSubscription);
router.get('/subscription-status', authenticate, getSubscriptionStatus);


export default router