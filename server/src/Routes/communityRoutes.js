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

const router = express.Router();

// Public routes
router.get('/get-all-communities', getCommunities);
router.get('/get-single-community/:id', getCommunity);

router.use(authenticate);

router.get('/get-user-communities', getMyCommunities);
router.post('/join-community/:id/join', joinCommunity);
router.post('/leave-community/:id/leave', leaveCommunity);

// Post routes
router.post('/create-post/:id/posts', createPost);
router.get('/get-posts/:id/posts', getPosts);

// Like routes
router.post('/toggle-like/:postId/like', toggleLike);

// Comment routes
router.post('/add-comment/:postId/comments', addComment);
router.get('/get-comment/:postId/comments', getComments);

export default router;