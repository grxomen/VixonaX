import mongoose from 'mongoose';

const blacklistSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['user', 'channel', 'role'],
    required: true
  },
  id: {
    type: String,
    required: true,
    unique: true
  },
  reason: {
    type: String,
    default: 'No reason provided'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Blacklist', blacklistSchema);

