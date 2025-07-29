import { register, login, sendResetOTP, verifyResetOTP, resetPassword, checkUserSubscription, guestUserEmail } from "../Controllers/UserController.js";
import express from "express";
import { authenticate } from "../Middleware/Authenticate.js";

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post("/send-otp", sendResetOTP);
router.post("/verify-otp", verifyResetOTP);
router.post("/reset-password", resetPassword);

router.get("/check-user-subscription-status", authenticate, checkUserSubscription);

router.post("/collect-email-for-guest", guestUserEmail);


export default router;