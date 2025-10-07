import { approveActivity, getParentApprovalActivity, changeTestUserPassword, getAllBadges, getAllMarketingUsers, deleteUser, getTestFamilyUsers, getUserDetailsWithActivities, getAllUsersWithSubscription, deleteParentsActivity, createBulkActivities, adminLogin,  createActivity , editParentsActivity, getAllActivities, getActivityCounts, getPlatformStats , getRewardPool, setRewardPool, getAllEvents} from "../Controllers/AdminController.js";
import express from 'express'
import {authenticate} from '../Middleware/Authenticate.js'

const router = express.Router();

router.post("/admin-login", adminLogin);
router.get("/get-all-badges", getAllBadges);

router.get('/get-all-parent-approval-activities', getParentApprovalActivity);
router.post("/create-bulk-activities", authenticate, createBulkActivities);
router.post("/create-activity-by-admin", authenticate, createActivity);

router.post('/approve-activity/:id', authenticate, approveActivity);
router.put('/edit-activity/:id', authenticate, editParentsActivity);
router.delete('/delete-activity/:id', authenticate, deleteParentsActivity);

router.get('/get-all-activities', authenticate, getAllActivities);
router.get('/get-activity-counts', authenticate, getActivityCounts);
router.get('/get-platform-stats', getPlatformStats);

router.get('/get-all-users-activities/:id', authenticate,getUserDetailsWithActivities);
router.get('/get-all-users', authenticate, getAllUsersWithSubscription);
router.get('/get-all-test-users', authenticate, getTestFamilyUsers);

router.delete('/delete-test-user/:id', authenticate, deleteUser);
router.get('/get-all-guest-user', getAllMarketingUsers);


router.post('/change-test-users-password', authenticate, changeTestUserPassword);

router.get('/get-reward-pool', getRewardPool);
router.post('/set-reward-pool', setRewardPool);


router.get("/get-all-tracking-events", getAllEvents)





export default router;