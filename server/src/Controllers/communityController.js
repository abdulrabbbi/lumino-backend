import Community from '../Models/Community.js';
import CommunityMember from '../Models/CommunityMember.js';
import CommunityPost from '../Models/CommunityPost.js';
import PostLike from '../Models/PostLike.js';
import PostComment from '../Models/PostComment.js';
import { canUserJoinCommunity, checkCommunityAccess, getUserCommunityLimit } from '../Utils/communityAccess.js';

// Get all communities (with user's join status)
export const getCommunities = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20, search = '' } = req.query;

    // Build query
    const query = { status: 'active' };
    if (search) {
      query.$text = { $search: search };
    }

    // Get communities
    const communities = await Community.find(query)
      .sort({ 'stats.memberCount': -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('createdBy', 'username firstName surname avatar')
      .lean();

    // Get user's membership status for each community
    const communityIds = communities.map(c => c._id);
    const memberships = await CommunityMember.find({
      user: userId,
      community: { $in: communityIds }
    }).lean();

    const membershipMap = {};
    memberships.forEach(m => {
      membershipMap[m.community.toString()] = m;
    });

    // Get user's community join limit
    const limitInfo = await getUserCommunityLimit(userId);

    // Add join status to each community
    const communitiesWithStatus = communities.map(community => {
      const membership = membershipMap[community._id.toString()];
      
      let joinStatus = 'not_joined';
      let buttonText = 'JOIN';
      let buttonStyle = 'bg-emerald-400';
      
      if (membership) {
        if (membership.status === 'joined') {
          joinStatus = 'joined';
          buttonText = 'JOINED';
          buttonStyle = 'bg-gray-300';
        } else if (membership.status === 'pending') {
          joinStatus = 'pending';
          buttonText = 'REQUESTED';
          buttonStyle = 'bg-yellow-400';
        }
      } else {
        // Check if user can join
        if (!limitInfo.canJoinMore && limitInfo.type === 'free') {
          buttonText = 'UPGRADE TO JOIN';
          buttonStyle = 'bg-gray-300';
        } else if (community.requiresApproval) {
          buttonText = 'REQUEST TO JOIN';
        }
      }

      return {
        ...community,
        joinStatus,
        buttonText,
        buttonStyle,
        canJoin: limitInfo.canJoinMore || membership?.status === 'joined',
        isLocked: !limitInfo.canJoinMore && !membership && limitInfo.type === 'free'
      };
    });

    const total = await Community.countDocuments(query);

    res.json({
      communities: communitiesWithStatus,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      limitInfo
    });
  } catch (error) {
    console.error('Error getting communities:', error);
    res.status(500).json({ error: 'Failed to fetch communities' });
  }
};
export const getCommunity = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const community = await Community.findById(id)
      .populate('createdBy', 'username firstName surname avatar')
      .lean();

    if (!community) {
      return res.status(404).json({ error: 'Community not found' });
    }

    // Check user's membership
    const membership = await CommunityMember.findOne({
      user: userId,
      community: id
    });

    // Check access
    const access = await checkCommunityAccess(userId, id);

    res.json({
      ...community,
      membership,
      hasAccess: access.hasAccess,
      canPost: membership?.permissions?.canPost || false
    });
  } catch (error) {
    console.error('Error getting community:', error);
    res.status(500).json({ error: 'Failed to fetch community' });
  }
};
export const joinCommunity = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if community exists
    const community = await Community.findById(id);
    if (!community) {
      return res.status(404).json({ error: 'Community not found' });
    }

    // Check if already a member
    const existingMembership = await CommunityMember.findOne({
      user: userId,
      community: id
    });

    if (existingMembership) {
      if (existingMembership.status === 'joined') {
        return res.status(400).json({ error: 'Already a member of this community' });
      }
      if (existingMembership.status === 'pending') {
        return res.status(400).json({ error: 'Join request already pending' });
      }
    }

    // Check if user can join
    const canJoinResult = await canUserJoinCommunity(userId);
    if (!canJoinResult.canJoin) {
      return res.status(403).json({ 
        error: 'Cannot join community',
        reason: canJoinResult.reason 
      });
    }

    // Check if community has member limit
    if (community.maxMembers > 0) {
      const currentMembers = await CommunityMember.countDocuments({
        community: id,
        status: 'joined'
      });
      if (currentMembers >= community.maxMembers) {
        return res.status(403).json({ error: 'Community has reached member limit' });
      }
    }

    // Create membership
    const membership = new CommunityMember({
      community: id,
      user: userId,
      status: community.requiresApproval ? 'pending' : 'joined',
      role: 'member',
      joinedAt: community.requiresApproval ? null : new Date()
    });

    await membership.save();

    // Update community stats if joined directly
    if (!community.requiresApproval) {
      await Community.findByIdAndUpdate(id, {
        $inc: { 'stats.memberCount': 1 }
      });
    }

    res.status(201).json({
      message: community.requiresApproval 
        ? 'Join request submitted' 
        : 'Successfully joined community',
      membership
    });
  } catch (error) {
    console.error('Error joining community:', error);
    res.status(500).json({ error: 'Failed to join community' });
  }
};
export const leaveCommunity = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Find membership
    const membership = await CommunityMember.findOne({
      user: userId,
      community: id,
      status: 'joined'
    });

    if (!membership) {
      return res.status(404).json({ error: 'Not a member of this community' });
    }

    // Update membership
    membership.status = 'left';
    membership.leftAt = new Date();
    await membership.save();

    // Update community stats
    await Community.findByIdAndUpdate(id, {
      $inc: { 'stats.memberCount': -1 }
    });

    res.json({ 
      message: 'Successfully left community',
      membership 
    });
  } catch (error) {
    console.error('Error leaving community:', error);
    res.status(500).json({ error: 'Failed to leave community' });
  }
};
export const createPost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { content, image, tags } = req.body;

    // Check membership and permissions
    const membership = await CommunityMember.findOne({
      user: userId,
      community: id,
      status: 'joined'
    });

    if (!membership) {
      return res.status(403).json({ error: 'Not a member of this community' });
    }

    if (!membership.permissions.canPost) {
      return res.status(403).json({ error: 'No permission to post in this community' });
    }

    // Create post
    const post = new CommunityPost({
      community: id,
      author: userId,
      content,
      image: image || null,
      tags: tags || []
    });

    await post.save();

    // Update community stats
    await Community.findByIdAndUpdate(id, {
      $inc: { 'stats.postCount': 1 }
    });

    // Populate author info
    await post.populate('author', 'username firstName surname avatar');

    res.status(201).json(post);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
};
export const getPosts = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;

    // Check membership
    const membership = await CommunityMember.findOne({
      user: userId,
      community: id,
      status: 'joined'
    });

    if (!membership) {
      return res.status(403).json({ error: 'Not a member of this community' });
    }

    // Get posts
    const posts = await CommunityPost.find({
      community: id,
      status: 'active'
    })
      .sort({ isPinned: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('author', 'username firstName surname avatar')
      .lean();

    // Get user's likes for these posts
    const postIds = posts.map(p => p._id);
    const userLikes = await PostLike.find({
      user: userId,
      post: { $in: postIds }
    }).lean();

    const likeMap = {};
    userLikes.forEach(like => {
      likeMap[like.post.toString()] = like.type;
    });

    // Add like status to each post
    const postsWithLikes = posts.map(post => ({
      ...post,
      userLiked: likeMap[post._id.toString()] || false,
      likeType: likeMap[post._id.toString()] || null
    }));

    const total = await CommunityPost.countDocuments({
      community: id,
      status: 'active'
    });

    res.json({
      posts: postsWithLikes,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error getting posts:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
};
export const toggleLike = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;
    const { type = 'like' } = req.body;

    // Check if post exists
    const post = await CommunityPost.findById(postId);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Check if user is member of the community
    const membership = await CommunityMember.findOne({
      user: userId,
      community: post.community,
      status: 'joined'
    });

    if (!membership) {
      return res.status(403).json({ error: 'Not a member of this community' });
    }

    // Check if already liked
    const existingLike = await PostLike.findOne({
      user: userId,
      post: postId
    });

    if (existingLike) {
      // Unlike
      await PostLike.findByIdAndDelete(existingLike._id);
      await CommunityPost.findByIdAndUpdate(postId, {
        $inc: { 'stats.likes': -1 }
      });

      res.json({ 
        message: 'Post unliked',
        liked: false,
        likes: post.stats.likes - 1
      });
    } else {
      // Like
      const like = new PostLike({
        user: userId,
        post: postId,
        type
      });

      await like.save();
      await CommunityPost.findByIdAndUpdate(postId, {
        $inc: { 'stats.likes': 1 }
      });

      res.status(201).json({
        message: 'Post liked',
        liked: true,
        likeType: type,
        likes: post.stats.likes + 1
      });
    }
  } catch (error) {
    console.error('Error toggling like:', error);
    res.status(500).json({ error: 'Failed to toggle like' });
  }
};
export const addComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;
    const { content, parentComment } = req.body;

    // Check if post exists
    const post = await CommunityPost.findById(postId);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Check if user is member of the community
    const membership = await CommunityMember.findOne({
      user: userId,
      community: post.community,
      status: 'joined'
    });

    if (!membership) {
      return res.status(403).json({ error: 'Not a member of this community' });
    }

    // Create comment
    const comment = new PostComment({
      post: postId,
      author: userId,
      content,
      parentComment: parentComment || null
    });

    await comment.save();

    // Update post comment count
    await CommunityPost.findByIdAndUpdate(postId, {
      $inc: { 'stats.comments': 1 }
    });

    // Update community stats
    await Community.findByIdAndUpdate(post.community, {
      $inc: { 'stats.commentCount': 1 }
    });

    // Populate author info
    await comment.populate('author', 'username firstName surname avatar');

    res.status(201).json(comment);
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
};
export const getComments = async (req, res) => {
  try {
    const { postId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const comments = await PostComment.find({
      post: postId,
      status: 'active',
      parentComment: null // Get only top-level comments
    })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('author', 'username firstName surname avatar')
      .lean();

    // Get replies for each comment
    const commentIds = comments.map(c => c._id);
    const replies = await PostComment.find({
      parentComment: { $in: commentIds },
      status: 'active'
    })
      .sort({ createdAt: 1 })
      .populate('author', 'username firstName surname avatar')
      .lean();

    // Group replies by parent comment
    const repliesMap = {};
    replies.forEach(reply => {
      const parentId = reply.parentComment.toString();
      if (!repliesMap[parentId]) {
        repliesMap[parentId] = [];
      }
      repliesMap[parentId].push(reply);
    });

    // Add replies to comments
    const commentsWithReplies = comments.map(comment => ({
      ...comment,
      replies: repliesMap[comment._id.toString()] || []
    }));

    const total = await PostComment.countDocuments({
      post: postId,
      status: 'active',
      parentComment: null
    });

    res.json({
      comments: commentsWithReplies,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error getting comments:', error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
};

// Get user's joined communities
export const getMyCommunities = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 20 } = req.query;

    const memberships = await CommunityMember.find({
      user: userId,
      status: 'joined'
    })
      .populate({
        path: 'community',
        select: 'name description image stats.memberCount category'
      })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean();

    const communities = memberships.map(m => ({
      ...m.community,
      joinedAt: m.joinedAt,
      role: m.role
    }));

    const total = await CommunityMember.countDocuments({
      user: userId,
      status: 'joined'
    });

    // Get user's community limit info
    const limitInfo = await getUserCommunityLimit(userId);

    res.json({
      communities,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      limitInfo
    });
  } catch (error) {
    console.error('Error getting user communities:', error);
    res.status(500).json({ error: 'Failed to fetch user communities' });
  }
};