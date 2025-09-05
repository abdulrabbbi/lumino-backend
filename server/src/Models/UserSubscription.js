import mongoose from 'mongoose';

const UserSubscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subscriptionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subscription',
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'cancelled', 'expired', 'pending', 'trial'],
    default: 'pending'
  },
  orderStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date
  },
  trialEndDate: {
    type: Date
  },
  stripeDetails: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  paymentHistory: [{
    amount: Number,
    currency: String,
    status: String,
    paymentDate: { type: Date, default: Date.now },
    stripeSessionId: String,
    stripePaymentIntentId: String,
    isTrialPayment: { type: Boolean, default: false }
  }],
  autoRenew: {
    type: Boolean,
    default: true
  },
  yearlyConvertedToMonthly: { type: Boolean, default: false },
  originalSubscriptionType: { type: String }, // To track if it was originally yearly

}, { timestamps: true });

export default mongoose.models.UserSubscription ||
  mongoose.model('UserSubscription', UserSubscriptionSchema);