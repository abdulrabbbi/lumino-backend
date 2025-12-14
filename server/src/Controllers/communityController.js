import Community from '../Models/Community.js';
import CommunityMember from '../Models/CommunityMember.js';
import CommunityPost from '../Models/CommunityPost.js';
import PostLike from '../Models/PostLike.js';
import PostComment from '../Models/PostComment.js';
import { canUserJoinCommunity, checkCommunityAccess, getUserCommunityLimit } from '../Utils/communityAccess.js';
import User from '../Models/User.js';

// Get all communities (with user's join status)
export const getCommunities = async (req, res) => {
  try {
    const userId = req.user ? req.user.userId : null;
    console.log(userId);

    const { page = 1, limit = 20, search = '' } = req.query;

    const query = { status: 'active' };
    if (search) {
      query.$text = { $search: search };
    }

    const communities = await Community.find(query)
      .sort({ 'stats.memberCount': -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('createdBy', 'username firstName surname avatar')
      .lean();

    let membershipMap = {};
    let joinedCommunitiesCount = 0;
    let isTestUser = false;
    let hasSubscription = false;

    if (userId) {
      const user = await User.findById(userId).select(
        'isTestFamily subscriptionActive'
      ).lean();

      isTestUser = user?.isTestFamily || false;
      hasSubscription = user?.subscriptionActive || false;

      const communityIds = communities.map(c => c._id);
      const memberships = await CommunityMember.find({
        user: userId,
        community: { $in: communityIds }
      }).lean();

      console.log(memberships);

      memberships.forEach(m => {
        membershipMap[m.community.toString()] = m;
      });

      // Get total joined communities count
      joinedCommunitiesCount = await CommunityMember.countDocuments({
        user: userId,
        status: 'joined'
      });
    }

    // Add join status to each community
    const communitiesWithStatus = communities.map((community) => {
      const membership = membershipMap[community._id.toString()];

      let joinStatus = 'not_joined';
      let buttonText = 'SIGNUP TO JOIN';
      let buttonStyle = 'bg-gray-300';
      let canJoin = false;
      let canView = false; // User can view only if joined member
      let isLocked = false;
      let redirectAction = 'signup';
      let viewMessage = ''; // Message for why user can't view

      if (userId) {
        // User is logged in
        if (membership) {
          if (membership.status === 'joined') {
            joinStatus = 'joined';
            buttonText = 'VIEW COMMUNITY';
            buttonStyle = 'bg-emerald-400';
            canJoin = true;
            canView = true; // ONLY joined members can view
            redirectAction = 'view';
          } else if (membership.status === 'pending') {
            joinStatus = 'pending';

            // Free user ne already 2 join kar rakhe hain, pending wali ko bhi nahi join kar sakta
            if (!isTestUser && !hasSubscription && joinedCommunitiesCount >= 2) {
              buttonText = 'UPGRADE TO JOIN';
              buttonStyle = 'bg-gray-300';
              canJoin = false;
              canView = false;
              isLocked = true;
              viewMessage = 'Free users can only join 2 communities. Upgrade to join more.';
              redirectAction = 'upgrade';
            } else {
              buttonText = 'REQUESTED';
              buttonStyle = 'bg-yellow-400';
              canJoin = false;
              canView = false;
              viewMessage = 'Your join request is pending approval';
              redirectAction = 'view';
            }
          } else if (membership.status === 'rejected') {
            joinStatus = 'rejected';

            // Check free user limits for rejected members too!
            if (!isTestUser && !hasSubscription && joinedCommunitiesCount >= 2) {
              // Free user has already joined 2 communities, show upgrade
              buttonText = 'UPGRADE TO JOIN';
              buttonStyle = 'bg-gray-300';
              canJoin = false;
              canView = false;
              isLocked = true;
              viewMessage = 'Free users can only join 2 communities. Upgrade to join more.';
              redirectAction = 'upgrade';
            } else {
              // User can request again (has subscription or hasn't reached limit)
              buttonText = 'REQUEST TO JOIN';
              buttonStyle = 'bg-emerald-400';
              canJoin = true;
              canView = false;
              viewMessage = 'Your join request was rejected';
              redirectAction = 'join';
            }
          } else if (membership.status === 'left') {
            joinStatus = 'left';

            // Check free user limits for left members too!
            if (!isTestUser && !hasSubscription && joinedCommunitiesCount >= 2) {
              // Free user has already joined 2 communities, show upgrade
              buttonText = 'UPGRADE TO JOIN';
              buttonStyle = 'bg-gray-300';
              canJoin = false;
              canView = false;
              isLocked = true;
              viewMessage = 'Free users can only join 2 communities. Upgrade to join more.';
              redirectAction = 'upgrade';
            } else {
              // User can rejoin (has subscription or hasn't reached limit)
              if (community.requiresApproval) {
                buttonText = 'REQUEST TO JOIN';
                buttonStyle = 'bg-emerald-400';
                canJoin = true;
                canView = false;
                viewMessage = 'You left this community';
                redirectAction = 'join';
              } else {
                buttonText = 'JOIN';
                buttonStyle = 'bg-emerald-400';
                canJoin = true;
                canView = false;
                viewMessage = 'You left this community';
                redirectAction = 'join';
              }
            }
          }
        } else {
          // User is not a member yet
          // Check user type based on your scenarios:

          // 1. Test User (isTestFamily = true) - can join all communities
          if (isTestUser) {
            if (community.requiresApproval) {
              buttonText = 'REQUEST TO JOIN';
              buttonStyle = 'bg-emerald-400';
              canJoin = true;
              canView = false; // Not a member, cannot view
              viewMessage = 'You need to join this community to view details';
              redirectAction = 'join';
            } else {
              buttonText = 'JOIN';
              buttonStyle = 'bg-emerald-400';
              canJoin = true;
              canView = false; // Not a member, cannot view
              viewMessage = 'You need to join this community to view details';
              redirectAction = 'join';
            }
          }
          // 2. User with active subscription - can join all communities
          else if (hasSubscription) {
            if (community.requiresApproval) {
              buttonText = 'REQUEST TO JOIN';
              buttonStyle = 'bg-emerald-400';
              canJoin = true;
              canView = false; // Not a member, cannot view
              viewMessage = 'You need to join this community to view details';
              redirectAction = 'join';
            } else {
              buttonText = 'JOIN';
              buttonStyle = 'bg-emerald-400';
              canJoin = true;
              canView = false; // Not a member, cannot view
              viewMessage = 'You need to join this community to view details';
              redirectAction = 'join';
            }
          }
          // 3. Free User (no subscription) - can only join first 3 communities
          else {
            // Check if user has ALREADY joined 2 communities
            if (joinedCommunitiesCount >= 2) {
              buttonText = 'UPGRADE TO JOIN';
              buttonStyle = 'bg-gray-300';
              canJoin = false;
              canView = false;
              isLocked = true;
              viewMessage = 'Free users can only join 2 communities. Upgrade to join more.';
              redirectAction = 'upgrade';
            } else {
              // User has joined less than 2 communities, can join more
              if (community.requiresApproval) {
                buttonText = 'REQUEST TO JOIN';
                buttonStyle = 'bg-emerald-400';
                canJoin = true;
                canView = false;
                viewMessage = 'You need to join this community to view details';
                redirectAction = 'join';
              } else {
                buttonText = 'JOIN';
                buttonStyle = 'bg-emerald-400';
                canJoin = true;
                canView = false;
                viewMessage = 'You need to join this community to view details';
                redirectAction = 'join';
              }
            }
          }
        }
      } else {
        // Guest user (not logged in)
        joinStatus = 'guest';
        buttonText = 'SIGNUP TO JOIN';
        buttonStyle = 'bg-gray-300';
        canJoin = false;
        canView = false; // Guest cannot view
        isLocked = true;
        viewMessage = 'Please signup to view community details';
        redirectAction = 'signup';
      }

      return {
        ...community,
        joinStatus,
        buttonText,
        buttonStyle,
        canJoin,
        canView, // NEW: Boolean flag
        isLocked,
        redirectAction,
        viewMessage, // NEW: Message for UI
        isGuest: !userId
      };
    });

    const total = await Community.countDocuments(query);

    res.json({
      communities: communitiesWithStatus,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      userInfo: userId ? {
        isTestUser,
        hasSubscription,
        joinedCommunitiesCount
      } : null
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
    const userId = req.user.userId;

    const user = await User.findById(userId).select(
      'isTestFamily subscriptionActive'
    ).lean();

    const isTestUser = user?.isTestFamily || false;
    const hasSubscription = user?.subscriptionActive || false;

    const community = await Community.findById(id);
    if (!community) {
      return res.status(404).json({ error: 'Community not found' });
    }

    // Check if membership already exists
    const existingMembership = await CommunityMember.findOne({
      user: userId,
      community: id
    });

    if (existingMembership) {
      switch (existingMembership.status) {
        case 'joined':
          return res.status(400).json({ error: 'Already a member of this community' });

        case 'pending':
          return res.status(400).json({ error: 'Join request already pending' });

        case 'rejected':
        case 'left':
          // Rejoin / retry request
          existingMembership.status = community.requiresApproval ? 'pending' : 'joined';
          existingMembership.joinedAt = community.requiresApproval ? null : new Date();
          existingMembership.leftAt = null;
          await existingMembership.save();

          // Update memberCount if directly joined
          if (!community.requiresApproval) {
            await Community.findByIdAndUpdate(id, { $inc: { 'stats.memberCount': 1 } });
          }

          return res.json({
            message: community.requiresApproval
              ? 'Join request submitted again'
              : 'Successfully re-joined community',
            membership: existingMembership
          });
      }
    }

    // Check free user limits
    const joinedCommunitiesCount = await CommunityMember.countDocuments({
      user: userId,
      status: 'joined'
    });

    if (!isTestUser && !hasSubscription && joinedCommunitiesCount >= 2) {
      return res.status(403).json({
        error: 'Community limit reached',
        message: 'Free users can only join 2 communities. Upgrade to join more.',
        redirectAction: 'upgrade'
      });
    }

    // Check community member limit
    if (community.maxMembers > 0) {
      const currentMembers = await CommunityMember.countDocuments({
        community: id,
        status: 'joined'
      });
      if (currentMembers >= community.maxMembers) {
        return res.status(403).json({ error: 'Community has reached member limit' });
      }
    }

    // Create new membership
    const membership = new CommunityMember({
      community: id,
      user: userId,
      status: community.requiresApproval ? 'pending' : 'joined',
      role: 'member',
      joinedAt: community.requiresApproval ? null : new Date()
    });

    await membership.save();

    // Update member count if directly joined
    if (!community.requiresApproval) {
      await Community.findByIdAndUpdate(id, { $inc: { 'stats.memberCount': 1 } });
    }

    res.status(201).json({
      message: community.requiresApproval ? 'Join request submitted' : 'Successfully joined community',
      membership,
      joinedCommunitiesCount: joinedCommunitiesCount + 1
    });

  } catch (error) {
    console.error('Error joining community:', error);
    res.status(500).json({ error: 'Failed to join community' });
  }
};

export const leaveCommunity = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

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
    const userId = req.user.userId;
    const { content, tags } = req.body;

    const image = req.file ? req.file.path : null;

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

    const post = new CommunityPost({
      community: id,
      author: userId,
      content,
      image: image,
      tags: tags ? JSON.parse(tags) : []
    });

    await post.save();

    await Community.findByIdAndUpdate(id, {
      $inc: { 'stats.postCount': 1 }
    });

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
    const userId = req.user ? req.user.userId : null;
    const { page = 1, limit = 20 } = req.query;

    // Get user info if logged in
    let userInfo = null;
    if (userId) {
      const user = await User.findById(userId).select(
        'isTestFamily subscriptionActive'
      ).lean();
      userInfo = {
        isTestUser: user?.isTestFamily || false,
        hasSubscription: user?.subscriptionActive || false
      };
    }

    // Check if community exists
    const community = await Community.findById(id);
    if (!community) {
      return res.status(404).json({ error: 'Community not found' });
    }

    // Check if user is member of this community
    let membership = null;
    let hasAccess = false;

    if (userId) {
      membership = await CommunityMember.findOne({
        user: userId,
        community: id
      });

      // User has access if:
      // 1. They are a test user OR
      // 2. They have active subscription OR
      // 3. Community is public OR
      // 4. User is a joined member
      hasAccess = userInfo?.isTestUser ||
        userInfo?.hasSubscription ||
        community.isPublic ||
        (membership && membership.status === 'joined');
    } else {
      // Guest user - only access public communities
      hasAccess = community.isPublic;
    }

    if (!hasAccess) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You need to join this community to view posts'
      });
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

    // Get user's likes for these posts (only if logged in)
    let likeMap = {};
    if (userId) {
      const postIds = posts.map(p => p._id);
      const userLikes = await PostLike.find({
        user: userId,
        post: { $in: postIds }
      }).lean();

      userLikes.forEach(like => {
        likeMap[like.post.toString()] = like.type;
      });
    }

    // Add like status and interaction info to each post
    const postsWithStats = posts.map(post => ({
      ...post,
      userLiked: userId ? (likeMap[post._id.toString()] || false) : false,
      likeType: userId ? (likeMap[post._id.toString()] || null) : null,
      canInteract: userId && hasAccess, // Only logged in users with access can like/comment
      stats: {
        likes: post.stats?.likes || 0,
        comments: post.stats?.comments || 0,
        shares: post.stats?.shares || 0
      }
    }));

    const total = await CommunityPost.countDocuments({
      community: id,
      status: 'active'
    });

    res.json({
      posts: postsWithStats,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      hasAccess,
      userType: userId ?
        (userInfo.isTestUser ? 'test' :
          userInfo.hasSubscription ? 'premium' : 'free') :
        'guest'
    });
  } catch (error) {
    console.error('Error getting posts:', error);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
};
export const toggleLike = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.userId;
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
    const userId = req.user.userId;
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