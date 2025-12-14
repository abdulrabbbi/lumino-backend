import mongoose from 'mongoose';

const CommunityMemberSchema = new mongoose.Schema({
  community: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Community',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  role: {
    type: String,
    enum: ['member', 'moderator', 'admin'],
    default: 'member'
  },
  status: {
    type: String,
    enum: ['pending', 'joined', 'rejected', 'left'],
    default: 'pending'
  },
  joinedAt: {
    type: Date,
    default: Date.now
  },
  leftAt: {
    type: Date
  },
  isMuted: {
    type: Boolean,
    default: false
  },
  muteExpiresAt: {
    type: Date
  },
  // Additional permissions
  permissions: {
    canPost: {
      type: Boolean,
      default: true
    },
    canComment: {
      type: Boolean,
      default: true
    },
    canInvite: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true
});

// Compound unique index
CommunityMemberSchema.index({ community: 1, user: 1 }, { unique: true });

export default mongoose.models.CommunityMember || 
  mongoose.model('CommunityMember', CommunityMemberSchema);