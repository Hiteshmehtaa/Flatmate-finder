import express from 'express';
import auth from '../middleware/auth.js';
import User from '../models/User.js';

const router = express.Router();

// Send friend request
router.post('/request', auth, async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (userId === req.user.id) {
      return res.status(400).json({ message: 'Cannot send friend request to yourself' });
    }

    const sender = await User.findById(req.user.id);
    const receiver = await User.findById(userId);

    if (!receiver) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if they're already friends
    if (sender.friends.includes(userId)) {
      return res.status(400).json({ message: 'Already friends with this user' });
    }

    // Check if request already sent
    if (sender.friendRequests.sent.includes(userId) || 
        receiver.friendRequests.received.includes(req.user.id)) {
      return res.status(400).json({ message: 'Friend request already sent' });
    }

    // Check if there's a pending request from the receiver
    if (sender.friendRequests.received.includes(userId)) {
      return res.status(400).json({ message: 'User has already sent you a friend request' });
    }

    sender.friendRequests.sent.push(userId);
    receiver.friendRequests.received.push(req.user.id);

    await sender.save();
    await receiver.save();

    res.json({ message: 'Friend request sent successfully' });
  } catch (error) {
    console.error('Send friend request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Accept friend request
router.post('/accept', auth, async (req, res) => {
  try {
    const { userId } = req.body;
    const receiver = await User.findById(req.user.id);
    const sender = await User.findById(userId);

    if (!sender) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if request exists
    if (!receiver.friendRequests.received.includes(userId)) {
      return res.status(400).json({ message: 'No friend request found from this user' });
    }

    // Check if already friends
    if (receiver.friends.includes(userId)) {
      return res.status(400).json({ message: 'Already friends with this user' });
    }

    // Add each user to the other's friends list
    receiver.friends.push(userId);
    sender.friends.push(req.user.id);

    // Remove the friend request
    receiver.friendRequests.received = receiver.friendRequests.received.filter(
      id => id.toString() !== userId
    );
    sender.friendRequests.sent = sender.friendRequests.sent.filter(
      id => id.toString() !== req.user.id
    );

    await receiver.save();
    await sender.save();

    res.json({ message: 'Friend request accepted!' });
  } catch (error) {
    console.error('Accept friend request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reject friend request
router.post('/reject', auth, async (req, res) => {
  try {
    const { userId } = req.body;
    const receiver = await User.findById(req.user.id);
    const sender = await User.findById(userId);

    if (!sender) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if request exists
    if (!receiver.friendRequests.received.includes(userId)) {
      return res.status(400).json({ message: 'No friend request found from this user' });
    }

    // Remove the friend request
    receiver.friendRequests.received = receiver.friendRequests.received.filter(
      id => id.toString() !== userId
    );
    sender.friendRequests.sent = sender.friendRequests.sent.filter(
      id => id.toString() !== req.user.id
    );

    await receiver.save();
    await sender.save();

    res.json({ message: 'Friend request rejected' });
  } catch (error) {
    console.error('Reject friend request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Cancel sent friend request
router.post('/cancel', auth, async (req, res) => {
  try {
    const { userId } = req.body;
    const sender = await User.findById(req.user.id);
    const receiver = await User.findById(userId);

    if (!receiver) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if request exists
    if (!sender.friendRequests.sent.includes(userId)) {
      return res.status(400).json({ message: 'No friend request found for this user' });
    }

    // Remove the friend request
    sender.friendRequests.sent = sender.friendRequests.sent.filter(
      id => id.toString() !== userId
    );
    receiver.friendRequests.received = receiver.friendRequests.received.filter(
      id => id.toString() !== req.user.id
    );

    await sender.save();
    await receiver.save();

    res.json({ message: 'Friend request cancelled' });
  } catch (error) {
    console.error('Cancel friend request error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove friend
router.post('/remove', auth, async (req, res) => {
  try {
    const { userId } = req.body;
    const user = await User.findById(req.user.id);
    const friend = await User.findById(userId);

    if (!friend) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if they are actually friends
    if (!user.friends.includes(userId)) {
      return res.status(400).json({ message: 'Not friends with this user' });
    }

    // Remove from both users' friend lists
    user.friends = user.friends.filter(id => id.toString() !== userId);
    friend.friends = friend.friends.filter(id => id.toString() !== req.user.id);

    await user.save();
    await friend.save();

    res.json({ message: 'Friend removed successfully' });
  } catch (error) {
    console.error('Remove friend error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get friend requests
router.get('/requests', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('friendRequests.received', 'username profilePic')
      .populate('friendRequests.sent', 'username profilePic');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      received: user.friendRequests.received || [],
      sent: user.friendRequests.sent || []
    });
  } catch (error) {
    console.error('Get friend requests error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;