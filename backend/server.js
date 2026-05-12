import 'dotenv/config';
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import messageRoutes from './routes/messages.js';
import aiRoutes from './routes/ai.js';
import uploadRoutes from './routes/upload.js';
import Message from './models/Message.js';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'https://chattymind-frontend.vercel.app',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

app.use(cors({
  origin: 'https://chattymind-frontend.vercel.app',
  credentials: true
}));
app.use(express.json());

// Track online users: userId -> socket.id
const onlineUsers = new Map();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/upload', uploadRoutes);

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Basic Health Check Route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'ChattyMind Backend is running' });
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  // User joins their own personal room (using their userId)
  socket.on('join_user', (userId) => {
    socket.join(userId);
    socket.userId = userId;
    onlineUsers.set(userId, socket.id);

    // Broadcast updated online users list
    io.emit('get_online_users', Array.from(onlineUsers.keys()));
    console.log(`User ${userId} joined their personal room`);
  });

  // Client specifically requests online users
  socket.on('request_online_users', () => {
    socket.emit('get_online_users', Array.from(onlineUsers.keys()));
  });

  // User joins a specific chat room (1-on-1 or group chat)
  socket.on('join_chat', (chatId) => {
    socket.join(chatId);
    console.log(`User joined chat room: ${chatId}`);
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Handle sending a message
  //
  // Architecture: The CLIENT sends the optimistic message via HTTP POST to
  // /api/messages/send (which handles DB persistence with tempId deduplication).
  // AFTER the HTTP call succeeds, the client emits 'send_message' here with
  // the confirmed DB data so we can relay it to the receiver.
  //
  // We emit ONLY to the receiver's personal userId room.
  // We do NOT emit back to the chatId room because the sender joined that room
  // via join_chat, which would cause the sender's own receive_message handler
  // to fire and display a duplicate.
  // ─────────────────────────────────────────────────────────────────────────
  socket.on('send_message', (data) => {
    const { receiverId } = data;

    // Relay the confirmed message only to the receiver's personal room
    if (receiverId) {
      socket.to(receiverId).emit('receive_message', data);
    }
  });

  // Typing indicators — emit to the chatId room (excluding sender)
  socket.on('typing', ({ chatId, userId }) => {
    socket.to(chatId).emit('typing', { userId });
  });

  socket.on('stop_typing', ({ chatId, userId }) => {
    socket.to(chatId).emit('stop_typing', { userId });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // Message status updates
  //
  // When the receiver marks messages as delivered/seen, notify the sender.
  // We emit to the sender's personal userId room instead of the chatId room
  // to keep status updates targeted and avoid chatId room collisions.
  // ─────────────────────────────────────────────────────────────────────────
  socket.on('messages_delivered', ({ chatId, senderId }) => {
    // Notify the sender (by their userId room) that their messages were delivered
    if (senderId) {
      socket.to(senderId).emit('message_status_update', { chatId, status: 'delivered' });
    } else {
      // Fallback: broadcast to chatId room (excludes current socket)
      socket.to(chatId).emit('message_status_update', { chatId, status: 'delivered' });
    }
  });

  socket.on('messages_seen', ({ chatId, senderId }) => {
    // Notify the sender (by their userId room) that their messages were seen
    if (senderId) {
      socket.to(senderId).emit('message_status_update', { chatId, status: 'seen' });
    } else {
      socket.to(chatId).emit('message_status_update', { chatId, status: 'seen' });
    }
  });

  socket.on('delete_message_everyone', ({ chatId, messageId }) => {
    socket.to(chatId).emit('message_deleted_everyone', { messageId });
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    if (socket.userId) {
      onlineUsers.delete(socket.userId);
      io.emit('get_online_users', Array.from(onlineUsers.keys()));
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
