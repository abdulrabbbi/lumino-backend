import mongoose from 'mongoose';

const PostCommentSchema = new mongoose.Schema({
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CommunityPost',
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  parentComment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PostComment'
  },
  content: {
    type: String,
    required: true,
    trim: true
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
    enum: ['active', 'deleted', 'hidden'],
    default: 'active'
  },
  likes: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for post comments
PostCommentSchema.index({ post: 1, createdAt: -1 });
PostCommentSchema.index({ author: 1, createdAt: -1 });

export default mongoose.models.PostComment || 
  mongoose.model('PostComment', PostCommentSchema);