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

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // For development. Update in production.
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

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
    console.log(`User ${userId} joined their personal room`);
  });

  // User joins a specific chat room (1-on-1 or group chat)
  socket.on('join_chat', (chatId) => {
    socket.join(chatId);
    console.log(`User joined chat room: ${chatId}`);
  });

  // Handle sending a message
  socket.on('send_message', (data) => {
    const { chatId, senderId, text, receiverId } = data;
    // Broadcast message to everyone in the chat room (including sender if needed, or exclude sender)
    // Normally, the sender optimistically updates their UI, so we can broadcast to the room minus the sender, 
    // or just broadcast to the whole room and let frontend filter duplicates.
    socket.to(chatId).emit('receive_message', data);
    
    // Also notify the receiver directly if they are connected (useful for notifications)
    if (receiverId) {
       socket.to(receiverId).emit('new_message_notification', data);
    }
  });

  // Typing indicators
  socket.on('typing', ({ chatId, userId }) => {
    socket.to(chatId).emit('typing', { userId });
  });

  socket.on('stop_typing', ({ chatId, userId }) => {
    socket.to(chatId).emit('stop_typing', { userId });
  });

  // Message status updates
  socket.on('messages_delivered', ({ chatId, receiverId }) => {
    socket.to(chatId).emit('message_status_update', { chatId, status: 'delivered' });
  });

  socket.on('messages_seen', ({ chatId, receiverId }) => {
    socket.to(chatId).emit('message_status_update', { chatId, status: 'seen' });
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
