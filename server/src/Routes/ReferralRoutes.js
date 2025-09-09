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

// Apply referral code after signup
router.post('/apply', authenticate, applyReferralCodeAfterSignup);

// Get referral code
router.get('/code', authenticate, getReferralCode);

// Get referral stats
router.get('/stats', authenticate, getReferralStats);

// Check referral reward
router.get('/check-reward', authenticate, checkReferralReward);

export default router;