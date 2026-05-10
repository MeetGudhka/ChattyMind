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
// Get single user profile
router.get('/profile/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Server error fetching profile' });
  }
});

// Update user profile (tagline, phone number, settings)
router.put('/profile', async (req, res) => {
  try {
    const { userId, tagline, phoneNumber, baseTone, settings } = req.body;
    if (!userId) return res.status(400).json({ error: "userId is required" });

    const updateData = {};
    if (tagline !== undefined) updateData.tagline = tagline;
    if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;
    if (baseTone !== undefined) updateData.baseTone = baseTone;
    if (settings !== undefined) updateData.settings = settings;

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { returnDocument: 'after' }
    ).select('-password');

    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error) {
    console.error("Error updating profile", error);
    res.status(500).json({ error: 'Server error updating profile' });
  }
});

export default router;
