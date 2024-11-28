import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  profilePic: {
    type: String,
    default: 'default.jpg'
  },
  bio: String,
  college: String,
  preferences: {
    budget: Number,
    location: String,
    gender: String,
    roomType: String
  },
  isProfilePublic: {
    type: Boolean,
    default: true
  },
  friends: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  friendRequests: {
    sent: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    received: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
  }
}, { timestamps: true });

export default mongoose.model('User', userSchema);