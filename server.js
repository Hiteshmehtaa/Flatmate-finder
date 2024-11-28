import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import { Server } from 'socket.io';
import userRoutes from './routes/users.js';
import authRoutes from './routes/auth.js';
import friendRoutes from './routes/friends.js';
import chatRoutes from './routes/chat.js';
import Message from './models/Message.js';
import jwt from 'jsonwebtoken';

dotenv.config();
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(express.json());
app.use(cors());
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/friends', friendRoutes);
app.use('/api/chat', chatRoutes);

// Serve static files
app.use(express.static('public'));

// Socket.IO middleware for authentication
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error('Authentication required'));
  }

  try {
    const decoded = jwt.verify(token, 'your-secret-key');
    socket.userId = decoded.userId;
    next();
  } catch (err) {
    next(new Error('Invalid token'));
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.userId);

  socket.join(socket.userId);

  socket.on('private message', async (data) => {
    try {
      const message = new Message({
        sender: socket.userId,
        receiver: data.receiver,
        content: data.content
      });

      await message.save();
      
      const populatedMessage = await Message.findById(message._id)
        .populate('sender', 'username profilePic')
        .populate('receiver', 'username profilePic');

      io.to(data.receiver).emit('private message', populatedMessage);
    } catch (error) {
      console.error('Socket message error:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.userId);
  });
});

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/roomiezz')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});