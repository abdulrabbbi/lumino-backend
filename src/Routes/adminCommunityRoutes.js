import express from 'express';
import {
  adminGetCommunities,
  adminCreateCommunity,
  adminUpdateCommunity,
  adminDeleteCommunity,
  adminGetCommunityMembers,
  adminUpdateMember,
  adminRemoveMember,
  adminAddMember,
  adminGetCommunityPosts,
  adminManagePost,
  adminGetPostComments,
  adminManageComment,
  adminSyncCommunityStats,
  adminGetCommunityAnalytics,
  adminGetCommunityPendingRequests,
  adminApproveRejectRequest,
  adminGetCommunityById
} from '../Controllers/adminCommunityController.js';
import { authenticate } from '../Middleware/Authenticate.js';

const router = express.Router();

// router.use(authenticate);

// Community management
router.get('/get-all-communities-for-admin', adminGetCommunities);
router.get('/get-community-by-id/:id', authenticate, adminGetCommunityById)
router.post('/create-community',authenticate, adminCreateCommunity);
router.put('/update-community/:id',authenticate, adminUpdateCommunity);
router.delete('/delete-community/:id',authenticate, adminDeleteCommunity);

// Community stats and analytics
router.get('/get-community-stats/:id/sync-stats',authenticate, adminSyncCommunityStats);
router.get('/get-community-analytics/:id/analytics',authenticate, adminGetCommunityAnalytics);

// Member management
router.get('/get-community-members/:id/members',authenticate, adminGetCommunityMembers);
router.post('/add-member/:id/members',authenticate, adminAddMember);
router.put('/update-member/:id/members/:memberId',authenticate, adminUpdateMember);
router.delete('/remove-member/:id/members/:memberId',authenticate, adminRemoveMember);

// Post management
router.get('/get-community-posts/:id/posts',authenticate, adminGetCommunityPosts);
router.put('/manage-community-posts/:id/posts/:postId',authenticate, adminManagePost);

// Comment management
router.get('/get-post-comments/:postId/comments',authenticate, adminGetPostComments);
router.put('/manage-comments/:commentId',authenticate, adminManageComment);

router.get('/get-all-pending-requests-for-community/:id', authenticate, adminGetCommunityPendingRequests); 
router.post('/process-request/:id', authenticate, adminApproveRejectRequest); 

export default router;