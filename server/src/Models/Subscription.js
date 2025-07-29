import mongoose from 'mongoose';

const SubscriptionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    required: true
  },
  details: {
    type: [String], 
    default: []
  },
  price: {
    type: Number,
    required: true
  },
  priceType: {
    type: String,
    enum: ['monthly', 'yearly', 'one-time'],
    required: true
  },
  currency: {
    type: String,
    default: 'EUR'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

export default mongoose.models.Subscription || mongoose.model('Subscription', SubscriptionSchema);
