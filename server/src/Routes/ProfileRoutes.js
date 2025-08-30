import { authenticate } from "../Middleware/Authenticate.js";
import { getProfileInfo, updateChildSetting , checkProfileExists, getBadgePercentage, updateNotificationSettings, getUserBadges } from "../Controllers/ProfileController.js";

import express from 'express'

const router = express.Router()

router.get("/get-user-info", authenticate, getProfileInfo);
router.post("/update-child-setting", authenticate, updateChildSetting);
router.post("/update-notification-settings", authenticate, updateNotificationSettings);
router.get("/get-user-badges", authenticate, getUserBadges);

router.get("/get-badge-percentage", authenticate, getBadgePercentage);
router.get("/check-profile-exists", authenticate, checkProfileExists);


export default router