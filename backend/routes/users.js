import express from 'express';
import User from '../models/User.js';

const router = express.Router();

// Get all users except the current one (for sidebar)
router.get('/', async (req, res) => {
  try {
    const currentUserId = req.query.currentUserId;
    if (!currentUserId) return res.status(400).json({ error: "currentUserId is required" });

    const users = await User.find({ _id: { $ne: currentUserId } }).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Server error fetching users' });
  }
});

export default router;
