import express from 'express';
import {
  getCommunities,
  getCommunity,
  joinCommunity,
  leaveCommunity,
  createPost,
  getPosts,
  toggleLike,
  addComment,
  getComments,
  getMyCommunities
} from '../Controllers/communityController.js';
import { authenticate } from '../Middleware/Authenticate.js';
import upload from '../Middleware/Upload.js';
import {optionalAuth} from '../Middleware/OptionalAuth.js'

const router = express.Router();

// Public routes
// in this if token is null it means user is guest , otherwise user is logged in
router.get('/get-all-communities-public', optionalAuth, getCommunities);
router.get('/get-single-community-public/:id', authenticate, getCommunity);


// after login routes
router.get('/get-user-communities', authenticate, getMyCommunities);
router.post('/join-community/:id/join', authenticate, joinCommunity);
router.post('/leave-community/:id/leave', authenticate, leaveCommunity);

// Post routes
router.post('/create-post/:id/posts', authenticate, upload.single('file'), createPost);
router.get('/get-posts/:id/posts', optionalAuth, getPosts);

// Like routes
router.post('/toggle-like/:postId/like', authenticate, toggleLike);

// Comment routes
router.post('/add-comment/:postId/comments', authenticate, addComment);
router.get('/get-comment/:postId/comments', authenticate, getComments);

export default router;