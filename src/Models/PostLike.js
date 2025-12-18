import mongoose from 'mongoose';

const PostLikeSchema = new mongoose.Schema({
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CommunityPost',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['like', 'love', 'celebrate', 'insightful', 'curious'],
    default: 'like'
  }
}, {
  timestamps: true
});

// Compound unique index
PostLikeSchema.index({ post: 1, user: 1 }, { unique: true });

export default mongoose.models.PostLike || 
  mongoose.model('PostLike', PostLikeSchema);