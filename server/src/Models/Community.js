  import mongoose from 'mongoose';

  const CommunitySchema = new mongoose.Schema({
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true
    },
    image: {
      type: String,
      required: true
    },
    coverImage: {
      type: String, 
      default: ''
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    isPublic: {
      type: Boolean,
      default: true
    },
    requiresApproval: {
      type: Boolean,
      default: false
    },
    maxMembers: {
      type: Number,
      default: 0 // 0 means unlimited
    },
    category: {
      type: String,
    },
    tags: [{
      type: String
    }],
    rules: [{
      type: String
    }],
    status: {
      type: String,
      default: 'active',
    },
    stats: {
      memberCount: {
        type: Number,
        default: 0
      },
      postCount: {
        type: Number,
        default: 0
      },
      commentCount: {
        type: Number,
        default: 0
      }
    }
  }, {
    timestamps: true
  });

  // Index for search
  CommunitySchema.index({ name: 'text', description: 'text', tags: 'text' });

  export default mongoose.models.Community || 
    mongoose.model('Community', CommunitySchema);