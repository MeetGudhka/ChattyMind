import express from 'express';
import mongoose from 'mongoose';
import Message from '../models/Message.js';
import Chat from '../models/Chat.js';

const router = express.Router();

// Get unread message counts for a user, grouped by sender
router.get('/unread-counts/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid User ID' });
    }
    const userObjectId = new mongoose.Types.ObjectId(userId);
    
    // Use stable find() instead of aggregate() to avoid Location15998/Location40352 errors
    const unreadMessages = await Message.find({ 
      receiverId: userObjectId, 
      isFirstSeen: false 
    }).select('senderId');
    
    // Convert to simple object { senderId: count }
    const counts = unreadMessages.reduce((acc, curr) => {
      const sId = curr.senderId.toString();
      acc[sId] = (acc[sId] || 0) + 1;
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
    const messages = await Message.find({ 
      chatId: chat._id,
      deletedBy: { $ne: userId }
    }).sort({ createdAt: 1 });
    res.json({ chat, messages });

  } catch (error) {
    res.status(500).json({ message: 'Error fetching chat messages' });
  }
});

// Send a message
router.post('/send', async (req, res) => {
  try {
    const { chatId, senderId, receiverId, text, mediaUrl, mediaType } = req.body;

    const newMessage = new Message({
      chatId,
      senderId,
      receiverId,
      text,
      mediaUrl,
      mediaType
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
    
    // Always mark as isFirstSeen = true so the bubble disappears for the receiver
    await Message.updateMany(
      { chatId, receiverId, isFirstSeen: false },
      { $set: { isFirstSeen: true } }
    );

    // Check if the receiver has read receipts enabled
    const User = mongoose.model('User');
    const receiver = await User.findById(receiverId);
    const canSendSeen = receiver?.settings?.readReceipts !== false;

    if (!canSendSeen) {
      return res.json({ success: true, message: 'Read receipts disabled: only isFirstSeen updated' });
    }

    await Message.updateMany(
      { chatId, receiverId, status: { $in: ['sent', 'delivered'] } },
      { $set: { status: 'seen' } }
    );
    res.json({ success: true });
  } catch (error) {
    console.error("Error updating seen status:", error);
    res.status(500).json({ message: 'Error updating seen status' });
  }
});

// Delete a message
router.delete('/:messageId', async (req, res) => {
  try {
    const { messageId } = req.params;
    const { type, userId } = req.body;

    const message = await Message.findById(messageId);
    if (!message) return res.status(404).json({ message: 'Message not found' });

    if (type === 'for_everyone') {
      if (message.senderId.toString() !== userId) {
        return res.status(403).json({ message: 'Unauthorized to delete for everyone' });
      }

      message.isDeletedForEveryone = true;
      message.text = 'This message was deleted';
      message.mediaUrl = '';
      message.mediaType = '';
      
      await message.save();
      return res.json({ success: true, message });
    } else if (type === 'for_me') {
      if (!message.deletedBy.includes(userId)) {
        message.deletedBy.push(userId);
        await message.save();
      }
      return res.json({ success: true });
    } else {
      return res.status(400).json({ message: 'Invalid delete type' });
    }
  } catch (error) {
    console.error("Error deleting message:", error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get message analytics for a user
router.get('/analytics/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid User ID' });
    }
    const userObjectId = new mongoose.Types.ObjectId(userId);
    
    // Simple counts
    const sentCount = await Message.countDocuments({ senderId: userObjectId });
    const receivedCount = await Message.countDocuments({ receiverId: userObjectId });
    
    // Daily trends (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const sevenDaysAgoStr = sevenDaysAgo.toISOString();
    
    // Fetch all user's sent messages and filter/group in JS for maximum stability
    const allSentMessages = await Message.find({ senderId: userObjectId }).select('createdAt');
    
    const trendMap = {};
    allSentMessages.forEach(m => {
      const createdAtStr = m.createdAt.toISOString();
      if (createdAtStr >= sevenDaysAgoStr) {
        const day = createdAtStr.split('T')[0]; // YYYY-MM-DD
        trendMap[day] = (trendMap[day] || 0) + 1;
      }
    });

    const dailyTrends = Object.keys(trendMap)
      .sort()
      .map(day => ({
        day: day.split('-').slice(1).join('/'), // MM/DD
        count: trendMap[day]
      }));

    res.json({
      sentCount,
      receivedCount,
      dailyTrends
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    res.status(500).json({ message: 'Error fetching analytics' });
  }
});

export default router;
