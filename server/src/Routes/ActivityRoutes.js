import { createActivity, rateActivity, getTotalActivitiesCount, getActivityLibrary, getPlayWeekActivities, getProgressStats, getSingleActivity, filterActivities, markActivityCompleted, toggleFavorite, getUserFavorites} from "../Controllers/ActivityController.js";
import { authenticate } from "../Middleware/Authenticate.js";
import { optionalAuth } from "../Middleware/OptionalAuth.js";
import express from 'express'

const router = express.Router()

router.post("/create-activity", authenticate, createActivity);

router.post("/rate-activity/:id", optionalAuth, rateActivity);

router.get("/get-all-activity-library", optionalAuth, getActivityLibrary);
router.get("/get-playweek-activities", optionalAuth, getPlayWeekActivities);
router.get("/get-single-activity/:id", optionalAuth, getSingleActivity);
router.get("/filter-activities", optionalAuth, filterActivities);
router.post("/mark-activity-as-completed/:id", optionalAuth, markActivityCompleted);

router.get("/get-total-activities-count", getTotalActivitiesCount);


router.get("/get-progress", optionalAuth, getProgressStats);

router.post('/toggle-favourite-activity', optionalAuth, toggleFavorite)
router.get("/get-user-favorite-activities", optionalAuth, getUserFavorites)









export default router