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


// after login routes
router.get('/get-user-communities', authenticate, getMyCommunities);
router.post('/join-community/:id/join', authenticate, joinCommunity);
router.post('/leave-community/:id/leave', authenticate, leaveCommunity);

// Post routes
router.post('/create-post/:id/posts', authenticate, createPost);
router.get('/get-posts/:id/posts', authenticate, getPosts);

// Like routes
router.post('/toggle-like/:postId/like', authenticate, toggleLike);

// Comment routes
router.post('/add-comment/:postId/comments', authenticate, addComment);
router.get('/get-comment/:postId/comments', authenticate, getComments);

export default router;