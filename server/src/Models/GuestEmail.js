import mongoose from 'mongoose';

const guestEmailSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/.+\@.+\..+/, 'Please fill a valid email address']
  },
  pageVisited: {
    type: String,
    default: 'activities'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  marketingConsent: {
    type: Boolean,
    default: true
  }
});

const GuestEmail = mongoose.model('GuestEmail', guestEmailSchema);

export default GuestEmail;