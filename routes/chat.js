import express from 'express';
import auth from '../middleware/auth.js';
import Message from '../models/Message.js';
import User from '../models/User.js';

const router = express.Router();

// Get chat history with a specific user
router.get('/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Verify users are friends
    const user = await User.findById(req.user.id);
    if (!user.friends.includes(userId)) {
      return res.status(403).json({ message: 'You must be friends to chat' });
    }

    // Get messages between users
    const messages = await Message.find({
      $or: [
        { sender: req.user.id, receiver: userId },
        { sender: userId, receiver: req.user.id }
      ]
    })
    .sort({ createdAt: 1 })
    .populate('sender', 'username profilePic')
    .populate('receiver', 'username profilePic');

    res.json(messages);
  } catch (error) {
    console.error('Get chat history error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark messages as read
router.post('/read/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    
    await Message.updateMany(
      { sender: userId, receiver: req.user.id, read: false },
      { read: true }
    );

    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    console.error('Mark messages read error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;