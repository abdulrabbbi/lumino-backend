// routes/referral.js - NEW ROUTE FILE
import express from 'express';
import {
  getReferralCode,
  applyReferralCodeAfterSignup,
  getReferralStats,
  checkReferralReward
} from '../Controllers/referralController.js';
import { authenticate } from '../Middleware/Authenticate.js';

const router = express.Router();

router.post('/apply', authenticate, applyReferralCodeAfterSignup);
router.get('/code', authenticate, getReferralCode);
router.get('/stats', authenticate, getReferralStats);
router.get('/check-reward', authenticate, checkReferralReward);

export default router;