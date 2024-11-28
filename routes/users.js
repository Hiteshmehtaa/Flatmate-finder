import express from 'express';
import auth from '../middleware/auth.js';
import upload from '../config/multer.js';
import User from '../models/User.js';

const router = express.Router();

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('-password')
      .populate('friends', 'username profilePic');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update profile
router.put('/profile', auth, upload.single('profilePic'), async (req, res) => {
  try {
    const updates = {};
    
    // Handle basic fields
    ['username', 'bio', 'college'].forEach(field => {
      if (req.body[field]) {
        updates[field] = req.body[field];
      }
    });

    // Handle preferences
    if (req.body.preferences) {
      updates.preferences = {};
      const preferences = JSON.parse(req.body.preferences);
      ['budget', 'location', 'gender', 'roomType'].forEach(field => {
        if (preferences[field]) {
          updates.preferences[field] = preferences[field];
        }
      });
    }

    // Handle profile picture
    if (req.file) {
      updates.profilePic = req.file.filename;
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user, message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Search users
router.get('/search', auth, async (req, res) => {
  try {
    const { college, location, budget } = req.query;
    const query = { 
      _id: { $ne: req.user.id },
      isProfilePublic: true
    };

    if (college) {
      query.college = new RegExp(college, 'i');
    }
    if (location) {
      query['preferences.location'] = new RegExp(location, 'i');
    }
    if (budget) {
      query['preferences.budget'] = { $lte: parseInt(budget) };
    }

    const users = await User.find(query)
      .select('username profilePic college preferences')
      .limit(20);

    res.json(users);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;