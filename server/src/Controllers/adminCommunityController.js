import Community from '../Models/Community.js';
import CommunityMember from '../Models/CommunityMember.js';
import CommunityPost from '../Models/CommunityPost.js';
import PostComment from '../Models/PostComment.js';
import User from '../Models/User.js';

export const adminGetCommunities = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      search = '', 
      status = 'active',
      category = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = {};
    
    if (status !== 'all') {
      query.status = status;
    }
    
    if (category) {
      query.category = category;
    }
    
    if (search) {
      query.$text = { $search: search };
    }

    // Sorting
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Get communities with detailed stats
    const communities = await Community.find(query)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('createdBy', 'username email firstName surname', )
      
      .lean();

      // console.log(communities);
      

    // Get additional stats for each community
    const communityIds = communities.map(c => c._id);
    
    // Get member counts
    const memberCounts = await CommunityMember.aggregate([
      { $match: { community: { $in: communityIds }, status: 'joined' } },
      { $group: { _id: '$community', count: { $sum: 1 } } }
    ]);

    // Get post counts
    const postCounts = await CommunityPost.aggregate([
      { $match: { community: { $in: communityIds }, status: 'active' } },
      { $group: { _id: '$community', count: { $sum: 1 } } }
    ]);

    // Get recent activity
    const recentActivities = await CommunityPost.aggregate([
      { $match: { community: { $in: communityIds } } },
      { $sort: { createdAt: -1 } },
      { $group: { 
        _id: '$community', 
        lastActivity: { $first: '$createdAt' },
        lastPostId: { $first: '$_id' }
      }}
    ]);

    // Create maps for quick lookup
    const memberCountMap = {};
    const postCountMap = {};
    const activityMap = {};

    memberCounts.forEach(item => {
      memberCountMap[item._id.toString()] = item.count;
    });

    postCounts.forEach(item => {
      postCountMap[item._id.toString()] = item.count;
    });

    recentActivities.forEach(item => {
      activityMap[item._id.toString()] = {
        lastActivity: item.lastActivity,
        lastPostId: item.lastPostId
      };
    });

    // Combine data
    const communitiesWithStats = communities.map(community => {
      const communityId = community._id.toString();
      return {
        ...community,
        stats: {
          ...community.stats,
          actualMemberCount: memberCountMap[communityId] || 0,
          actualPostCount: postCountMap[communityId] || 0
        },
        recentActivity: activityMap[communityId] || null,
        needsSync: 
          (memberCountMap[communityId] || 0) !== community.stats.memberCount ||
          (postCountMap[communityId] || 0) !== community.stats.postCount
      };
    });

    const total = await Community.countDocuments(query);

    res.json({
      communities: communitiesWithStats,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      stats: {
        totalCommunities: total,
        active: await Community.countDocuments({ status: 'active' }),
        archived: await Community.countDocuments({ status: 'archived' }),
        deleted: await Community.countDocuments({ status: 'deleted' })
      }
    });
  } catch (error) {
    console.error('Admin error getting communities:', error);
    res.status(500).json({ error: 'Failed to fetch communities' });
  }
};
export const adminCreateCommunity = async (req, res) => {
  try {
    const {
      name,
      description,
      image,
      coverImage = '',
      isPublic = true,
      requiresApproval = false,
      maxMembers = 0,
      category = 'general',
      tags = [],
      rules = []
    } = req.body;

    // Check if community with same name exists
    const existingCommunity = await Community.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') }
    });

    if (existingCommunity) {
      return res.status(400).json({ error: 'Community with this name already exists' });
    }

    // Create community
    const community = new Community({
      name,
      description,
      image,
      coverImage,
      isPublic,
      requiresApproval,
      maxMembers: parseInt(maxMembers),
      category,
      tags,
      rules,
      createdBy: req.user.userId
    });

    await community.save();

    // Add creator as admin member
    const membership = new CommunityMember({
      community: community._id,
      user: req.user.userId,
      role: 'admin',
      status: 'joined',
      permissions: {
        canPost: true,
        canComment: true,
        canInvite: true,
        canModerate: true
      }
    });

    await membership.save();

    res.status(201).json({
      message: 'Community created successfully',
      community,
      membership
    });
  } catch (error) {
    console.error('Admin error creating community:', error);
    res.status(500).json({ error: 'Failed to create community' });
  }
};
export const adminUpdateCommunity = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Remove fields that shouldn't be updated
    delete updateData._id;
    delete updateData.createdBy;
    delete updateData.createdAt;
    delete updateData.stats;

    // Check if community exists
    const community = await Community.findById(id);
    if (!community) {
      return res.status(404).json({ error: 'Community not found' });
    }

    // If updating name, check for duplicates
    if (updateData.name && updateData.name !== community.name) {
      const existingCommunity = await Community.findOne({ 
        name: { $regex: new RegExp(`^${updateData.name}$`, 'i') },
        _id: { $ne: id }
      });

      if (existingCommunity) {
        return res.status(400).json({ error: 'Community with this name already exists' });
      }
    }

    // Update community
    const updatedCommunity = await Community.findByIdAndUpdate(
      id,
      { 
        ...updateData,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    );

    res.json({
      message: 'Community updated successfully',
      community: updatedCommunity
    });
  } catch (error) {
    console.error('Admin error updating community:', error);
    res.status(500).json({ error: 'Failed to update community' });
  }
};
export const adminDeleteCommunity = async (req, res) => {
  try {
    const { id } = req.params;
    const { action = 'archive' } = req.body; // 'archive', 'delete', 'restore'

    const community = await Community.findById(id);
    if (!community) {
      return res.status(404).json({ error: 'Community not found' });
    }

    let updateData = {};
    let message = '';

    switch (action) {
      case 'archive':
        updateData = { status: 'archived' };
        message = 'Community archived successfully';
        break;
      
      case 'delete':
        updateData = { status: 'deleted' };
        message = 'Community marked as deleted';
        break;
      
      case 'restore':
        updateData = { status: 'active' };
        message = 'Community restored successfully';
        break;
      
      case 'permanent':
        // Permanent delete - remove all related data
        await CommunityMember.deleteMany({ community: id });
        await CommunityPost.deleteMany({ community: id });
        await PostComment.deleteMany({ 
          post: { $in: await CommunityPost.find({ community: id }).select('_id') }
        });
        await Community.findByIdAndDelete(id);
        
        return res.json({ 
          message: 'Community permanently deleted',
          deleted: true
        });
      
      default:
        return res.status(400).json({ error: 'Invalid action' });
    }

    const updatedCommunity = await Community.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    res.json({
      message,
      community: updatedCommunity
    });
  } catch (error) {
    console.error('Admin error deleting community:', error);
    res.status(500).json({ error: 'Failed to delete community' });
  }
};
export const adminGetCommunityMembers = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      page = 1,
      limit = 50,
      role = '',
      status = 'joined',
      search = ''
    } = req.query;

    // Build query
    const query = { community: id };
    
    if (status !== 'all') {
      query.status = status;
    }
    
    if (role) {
      query.role = role;
    }

    // If search is provided, look up users first
    let userFilter = null;
    if (search) {
      const users = await User.find({
        $or: [
          { username: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { firstName: { $regex: search, $options: 'i' } },
          { surname: { $regex: search, $options: 'i' } }
        ]
      }).select('_id');

      const userIds = users.map(u => u._id);
      if (userIds.length > 0) {
        query.user = { $in: userIds };
      } else {
        // No users found, return empty
        return res.json({
          members: [],
          total: 0,
          page: 1,
          pages: 0
        });
      }
    }

    // Get members with user details
    const members = await CommunityMember.find(query)
      .populate('user', 'username email firstName surname avatar subscriptionActive isTestFamily')
      .sort({ role: -1, joinedAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .lean();

    const total = await CommunityMember.countDocuments(query);
    console.log(members);
    

    // Get user subscription details
    const membersWithDetails = members
    .filter(member => member.user && member.role !== 'admin') // remove null users & admins
    .map(member => ({
      ...member,
      user: {
        ...member.user,
        userType: member.user.isTestFamily
          ? 'test'
          : member.user.subscriptionActive
          ? 'subscribed'
          : 'free'
      }
    }));
    // console.log(membersWithDetails);

    // Get counts by status
    const statusCounts = await CommunityMember.aggregate([
      { $match: { community: id } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Get counts by role
    const roleCounts = await CommunityMember.aggregate([
      { $match: { community: id, status: 'joined' } },
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);

    res.json({
      members: membersWithDetails,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit),
      stats: {
        statusCounts: statusCounts.reduce((acc, curr) => {
          acc[curr._id] = curr.count;
          return acc;
        }, {}),
        roleCounts: roleCounts.reduce((acc, curr) => {
          acc[curr._id] = curr.count;
          return acc;
        }, {})
      }
    });
  } catch (error) {
    console.error('Admin error getting community members:', error);
    res.status(500).json({ error: 'Failed to fetch community members' });
  }
};
export const adminUpdateMember = async (req, res) => {
  try {
    const { id, memberId } = req.params;
    const { role, status, permissions, isMuted, muteExpiresAt } = req.body;

    // Find membership
    const membership = await CommunityMember.findOne({
      _id: memberId,
      community: id
    }).populate('user', 'username email');

    if (!membership) {
      return res.status(404).json({ error: 'Member not found' });
    }

    // Update fields
    const updateData = {};
    
    if (role && ['member', 'moderator', 'admin'].includes(role)) {
      updateData.role = role;
    }
    
    if (status && ['pending', 'joined', 'rejected', 'left', 'banned'].includes(status)) {
      updateData.status = status;
      
      if (status === 'joined' && !membership.joinedAt) {
        updateData.joinedAt = new Date();
      }
      
      if (status === 'left' && !membership.leftAt) {
        updateData.leftAt = new Date();
      }
    }
    
    if (permissions) {
      updateData.permissions = {
        ...membership.permissions,
        ...permissions
      };
    }
    
    if (isMuted !== undefined) {
      updateData.isMuted = isMuted;
    }
    
    if (muteExpiresAt) {
      updateData.muteExpiresAt = new Date(muteExpiresAt);
    }

    const updatedMember = await CommunityMember.findByIdAndUpdate(
      memberId,
      updateData,
      { new: true }
    ).populate('user', 'username email firstName surname');

    // Update community stats if status changed from/to 'joined'
    if (status === 'joined' && membership.status !== 'joined') {
      await Community.findByIdAndUpdate(id, {
        $inc: { 'stats.memberCount': 1 }
      });
    } else if (membership.status === 'joined' && status !== 'joined') {
      await Community.findByIdAndUpdate(id, {
        $inc: { 'stats.memberCount': -1 }
      });
    }

    res.json({
      message: 'Member updated successfully',
      member: updatedMember
    });
  } catch (error) {
    console.error('Admin error updating member:', error);
    res.status(500).json({ error: 'Failed to update member' });
  }
};
export const adminRemoveMember = async (req, res) => {
  try {
    const { id, memberId } = req.params;
    const { ban = false } = req.body;

    const membership = await CommunityMember.findOne({
      _id: memberId,
      community: id
    });

    if (!membership) {
      return res.status(404).json({ error: 'Member not found' });
    }

    if (ban) {
      // Ban user
      await CommunityMember.findByIdAndUpdate(memberId, {
        status: 'banned',
        leftAt: new Date(),
        isMuted: true
      });
      
      // Update community stats if they were joined
      if (membership.status === 'joined') {
        await Community.findByIdAndUpdate(id, {
          $inc: { 'stats.memberCount': -1 }
        });
      }
      
      res.json({ 
        message: 'Member banned successfully',
        banned: true
      });
    } else {
      // Remove member
      await CommunityMember.findByIdAndDelete(memberId);
      
      // Update community stats if they were joined
      if (membership.status === 'joined') {
        await Community.findByIdAndUpdate(id, {
          $inc: { 'stats.memberCount': -1 }
        });
      }
      
      res.json({ 
        message: 'Member removed successfully',
        removed: true
      });
    }
  } catch (error) {
    console.error('Admin error removing member:', error);
    res.status(500).json({ error: 'Failed to remove member' });
  }
};
export const adminAddMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, email, role = 'member', skipApproval = true } = req.body;

    // Find community
    const community = await Community.findById(id);
    if (!community) {
      return res.status(404).json({ error: 'Community not found' });
    }

    // Find user by userId or email
    let user;
    if (userId) {
      user = await User.findById(userId);
    } else if (email) {
      user = await User.findOne({ email });
    }

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if already a member
    const existingMember = await CommunityMember.findOne({
      community: id,
      user: user._id
    });

    if (existingMember) {
      return res.status(400).json({ 
        error: 'User is already a member',
        membership: existingMember
      });
    }

    // Create membership
    const membership = new CommunityMember({
      community: id,
      user: user._id,
      role,
      status: skipApproval ? 'joined' : 'pending',
      joinedAt: skipApproval ? new Date() : null,
      permissions: {
        canPost: true,
        canComment: true,
        canInvite: role === 'admin' || role === 'moderator'
      }
    });

    await membership.save();

    // Update community stats if joined directly
    if (skipApproval) {
      await Community.findByIdAndUpdate(id, {
        $inc: { 'stats.memberCount': 1 }
      });
    }

    res.status(201).json({
      message: skipApproval 
        ? 'Member added successfully' 
        : 'Join invitation sent',
      membership: await membership.populate('user', 'username email firstName surname')
    });
  } catch (error) {
    console.error('Admin error adding member:', error);
    res.status(500).json({ error: 'Failed to add member' });
  }
};
export const adminGetCommunityPosts = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      page = 1,
      limit = 20,
      status = 'active',
      authorId = '',
      search = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = { community: id };
    
    if (status !== 'all') {
      query.status = status;
    }
    
    if (authorId) {
      query.author = authorId;
    }
    
    if (search) {
      query.$text = { $search: search };
    }

    // Sorting
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Get posts
    const posts = await CommunityPost.find(query)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('author', 'username email firstName surname avatar')
      .lean();

    // Get comment counts for each post
    const postIds = posts.map(p => p._id);
    const commentCounts = await PostComment.aggregate([
      { $match: { post: { $in: postIds }, status: 'active' } },
      { $group: { _id: '$post', count: { $sum: 1 } } }
    ]);

    const commentCountMap = {};
    commentCounts.forEach(item => {
      commentCountMap[item._id.toString()] = item.count;
    });

    // Add comment counts
    const postsWithDetails = posts.map(post => ({
      ...post,
      actualCommentCount: commentCountMap[post._id.toString()] || 0,
      needsSync: commentCountMap[post._id.toString()] !== post.stats.comments
    }));

    const total = await CommunityPost.countDocuments(query);

    res.json({
      posts: postsWithDetails,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Admin error getting community posts:', error);
    res.status(500).json({ error: 'Failed to fetch community posts' });
  }
};
export const adminManagePost = async (req, res) => {
  try {
    const { id, postId } = req.params;
    const { action, reason } = req.body;

    // Find post
    const post = await CommunityPost.findOne({
      _id: postId,
      community: id
    });

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    let updateData = {};
    let message = '';

    switch (action) {
      case 'pin':
        updateData = { isPinned: true };
        message = 'Post pinned successfully';
        break;
      
      case 'unpin':
        updateData = { isPinned: false };
        message = 'Post unpinned successfully';
        break;
      
      case 'archive':
        updateData = { status: 'archived' };
        message = 'Post archived successfully';
        break;
      
      case 'delete':
        updateData = { status: 'deleted' };
        message = 'Post marked as deleted';
        break;
      
      case 'restore':
        updateData = { status: 'active' };
        message = 'Post restored successfully';
        break;
      
      case 'hide':
        updateData = { status: 'hidden' };
        message = 'Post hidden from public view';
        break;
      
      default:
        return res.status(400).json({ error: 'Invalid action' });
    }

    const updatedPost = await CommunityPost.findByIdAndUpdate(
      postId,
      updateData,
      { new: true }
    ).populate('author', 'username email');

    // Log moderation action
    if (['archive', 'delete', 'hide'].includes(action)) {
      // You can create a moderation log here
      console.log(`Post ${postId} ${action}ed by admin ${req.user.id}. Reason: ${reason}`);
    }

    res.json({
      message,
      post: updatedPost
    });
  } catch (error) {
    console.error('Admin error managing post:', error);
    res.status(500).json({ error: 'Failed to manage post' });
  }
};
export const adminGetPostComments = async (req, res) => {
  try {
    const { postId } = req.params;
    const {
      page = 1,
      limit = 50,
      status = 'active'
    } = req.query;

    const comments = await PostComment.find({
      post: postId,
      ...(status !== 'all' && { status })
    })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('author', 'username email firstName surname avatar')
      .populate('parentComment')
      .lean();

    const total = await PostComment.countDocuments({ post: postId });

    res.json({
      comments,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Admin error getting post comments:', error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
};
export const adminManageComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { action, reason } = req.body;

    const comment = await PostComment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    let updateData = {};
    let message = '';

    switch (action) {
      case 'delete':
        updateData = { status: 'deleted' };
        message = 'Comment deleted successfully';
        break;
      
      case 'restore':
        updateData = { status: 'active' };
        message = 'Comment restored successfully';
        break;
      
      case 'hide':
        updateData = { status: 'hidden' };
        message = 'Comment hidden from public view';
        break;
      
      default:
        return res.status(400).json({ error: 'Invalid action' });
    }

    const updatedComment = await PostComment.findByIdAndUpdate(
      commentId,
      updateData,
      { new: true }
    ).populate('author', 'username email');

    // Update post comment count if needed
    if (action === 'delete' && comment.status === 'active') {
      await CommunityPost.findByIdAndUpdate(comment.post, {
        $inc: { 'stats.comments': -1 }
      });
    } else if (action === 'restore' && comment.status !== 'active') {
      await CommunityPost.findByIdAndUpdate(comment.post, {
        $inc: { 'stats.comments': 1 }
      });
    }

    res.json({
      message,
      comment: updatedComment
    });
  } catch (error) {
    console.error('Admin error managing comment:', error);
    res.status(500).json({ error: 'Failed to manage comment' });
  }
};
export const adminSyncCommunityStats = async (req, res) => {
  try {
    const { id } = req.params;

    // Get actual counts
    const actualMemberCount = await CommunityMember.countDocuments({
      community: id,
      status: 'joined'
    });

    const actualPostCount = await CommunityPost.countDocuments({
      community: id,
      status: 'active'
    });

    // Get total comments count
    const posts = await CommunityPost.find({ community: id }).select('_id');
    const postIds = posts.map(p => p._id);
    const actualCommentCount = await PostComment.countDocuments({
      post: { $in: postIds },
      status: 'active'
    });

    // Update community stats
    const updatedCommunity = await Community.findByIdAndUpdate(
      id,
      {
        'stats.memberCount': actualMemberCount,
        'stats.postCount': actualPostCount,
        'stats.commentCount': actualCommentCount
      },
      { new: true }
    );

    res.json({
      message: 'Community stats synced successfully',
      community: updatedCommunity,
      stats: {
        memberCount: actualMemberCount,
        postCount: actualPostCount,
        commentCount: actualCommentCount
      }
    });
  } catch (error) {
    console.error('Admin error syncing community stats:', error);
    res.status(500).json({ error: 'Failed to sync community stats' });
  }
};
export const adminGetCommunityAnalytics = async (req, res) => {
  try {
    const { id } = req.params;
    const { period = '30d' } = req.query; // 7d, 30d, 90d, 1y

    // Calculate date range
    const now = new Date();
    let startDate;
    
    switch (period) {
      case '7d':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case '30d':
        startDate = new Date(now.setDate(now.getDate() - 30));
        break;
      case '90d':
        startDate = new Date(now.setDate(now.getDate() - 90));
        break;
      case '1y':
        startDate = new Date(now.setDate(now.getDate() - 365));
        break;
      default:
        startDate = new Date(now.setDate(now.getDate() - 30));
    }

    // Get member growth data
    const memberGrowth = await CommunityMember.aggregate([
      {
        $match: {
          community: mongoose.Types.ObjectId(id),
          status: 'joined',
          joinedAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$joinedAt' },
            month: { $month: '$joinedAt' },
            day: { $dayOfMonth: '$joinedAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    // Get post activity
    const postActivity = await CommunityPost.aggregate([
      {
        $match: {
          community: mongoose.Types.ObjectId(id),
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    // Get top posters
    const topPosters = await CommunityPost.aggregate([
      {
        $match: {
          community: mongoose.Types.ObjectId(id),
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$author',
          postCount: { $sum: 1 },
          totalLikes: { $sum: '$stats.likes' },
          totalComments: { $sum: '$stats.comments' }
        }
      },
      { $sort: { postCount: -1 } },
      { $limit: 10 }
    ]);

    // Get user types distribution
    const members = await CommunityMember.find({
      community: id,
      status: 'joined'
    }).populate('user');

    const userTypeDistribution = {
      test: 0,
      subscribed: 0,
      free: 0
    };

    members.forEach(member => {
      if (member.user.isTestFamily) {
        userTypeDistribution.test++;
      } else if (member.user.subscriptionActive) {
        userTypeDistribution.subscribed++;
      } else {
        userTypeDistribution.free++;
      }
    });

    // Get engagement rate (posts per member)
    const community = await Community.findById(id);
    const engagementRate = community.stats.memberCount > 0 
      ? (community.stats.postCount / community.stats.memberCount).toFixed(2)
      : 0;

    res.json({
      analytics: {
        period,
        startDate,
        endDate: new Date(),
        memberGrowth,
        postActivity,
        topPosters,
        userTypeDistribution,
        engagementRate,
        summary: {
          totalMembers: community.stats.memberCount,
          totalPosts: community.stats.postCount,
          totalComments: community.stats.commentCount,
          avgPostsPerDay: postActivity.length > 0 
            ? (community.stats.postCount / ((new Date() - startDate) / (1000 * 60 * 60 * 24))).toFixed(2)
            : 0
        }
      }
    });
  } catch (error) {
    console.error('Admin error getting community analytics:', error);
    res.status(500).json({ error: 'Failed to fetch community analytics' });
  }
};