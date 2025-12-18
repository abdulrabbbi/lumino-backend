import mongoose from 'mongoose';

const CommunityPostSchema = new mongoose.Schema({
  community: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Community',
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  image: {
    type: String
  },
  attachments: [{
    type: String // URLs to attached files
  }],
  tags: [{
    type: String
  }],
  isPinned: {
    type: Boolean,
    default: false
  },
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: {
    type: Date
  },
  status: {
    type: String,
    enum: ['active', 'archived', 'deleted', 'hidden'],
    default: 'active'
  },
  stats: {
    likes: {
      type: Number,
      default: 0
    },
    comments: {
      type: Number,
      default: 0
    },
    shares: {
      type: Number,
      default: 0
    }
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Index for community feed
CommunityPostSchema.index({ community: 1, createdAt: -1 });
CommunityPostSchema.index({ author: 1, createdAt: -1 });

export default mongoose.models.CommunityPost || 
  mongoose.model('CommunityPost', CommunityPostSchema);