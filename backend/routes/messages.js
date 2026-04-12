import express from 'express';
import mongoose from 'mongoose';
import Message from '../models/Message.js';
import Chat from '../models/Chat.js';

const router = express.Router();

// Get unread message counts for a user, grouped by sender
router.get('/unread-counts/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const unreadMessages = await Message.aggregate([
      { $match: { receiverId: new mongoose.Types.ObjectId(userId), status: { $ne: 'seen' } } },
      { $group: { _id: "$senderId", count: { $sum: 1 } } }
    ]);
    
    // Convert to simple object { senderId: count }
    const counts = unreadMessages.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {});
    
    res.json(counts);
  } catch (error) {
    console.error("Error fetching unread counts", error);
    res.status(500).json({ message: 'Error fetching unread counts' });
  }
});

// Get or create a 1-on-1 chat and fetch messages
router.get('/:userId/:otherUserId', async (req, res) => {
  try {
    const { userId, otherUserId } = req.params;

    // Find if chat exists between these two users
    let chat = await Chat.findOne({
      isGroupChat: false,
      participants: { $all: [userId, otherUserId] }
    });

    if (!chat) {
      // Create new chat
      chat = new Chat({
        participants: [userId, otherUserId],
        isGroupChat: false
      });
      await chat.save();
      return res.json({ chat, messages: [] });
    }

    // Fetch messages for this chat
    const messages = await Message.find({ chatId: chat._id }).sort({ createdAt: 1 });
    res.json({ chat, messages });

  } catch (error) {
    res.status(500).json({ message: 'Error fetching chat messages' });
  }
});

// Send a message (also done via socket, but REST is good for DB saving fallback)
router.post('/send', async (req, res) => {
  try {
    const { chatId, senderId, receiverId, text, mediaUrl } = req.body;

    const newMessage = new Message({
      chatId,
      senderId,
      receiverId,
      text,
      mediaUrl
    });

    await newMessage.save();
    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ message: 'Error saving message' });
  }
});
// Mark messages as delivered
router.put('/mark-delivered', async (req, res) => {
  try {
    const { chatId, receiverId } = req.body;
    await Message.updateMany(
      { chatId, receiverId, status: 'sent' },
      { $set: { status: 'delivered' } }
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Error updating delivery status' });
  }
});

// Mark messages as seen
router.put('/mark-seen', async (req, res) => {
  try {
    const { chatId, receiverId } = req.body;
    await Message.updateMany(
      { chatId, receiverId, status: { $in: ['sent', 'delivered'] } },
      { $set: { status: 'seen' } }
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Error updating seen status' });
  }
});

// Get unread message counts for a user, grouped by sender
router.get('/unread-counts/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const unreadMessages = await Message.aggregate([
      { $match: { receiverId: new mongoose.Types.ObjectId(userId), status: { $ne: 'seen' } } },
      { $group: { _id: "$senderId", count: { $sum: 1 } } }
    ]);
    
    // Convert to simple object { senderId: count }
    const counts = unreadMessages.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {});
    
    res.json(counts);
  } catch (error) {
    console.error("Error fetching unread counts", error);
  }
});

export default router;
