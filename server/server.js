require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');

const authRoutes = require('./routes/authRoutes');
const fileRoutes = require('./routes/fileRoutes');

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files from uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/files', fileRoutes);

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const PORT = 3001;
const MONGO_URL = process.env.MONGO_URL || 'mongodb+srv://shubhamsingh270218_db_user:yrbud4q1bPYe78kL@cluster0.9zehehd.mongodb.net/?appName=Cluster0';

mongoose.connect(MONGO_URL)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Global state trackers
const onlineUsers = new Map(); // socketId -> { userId, username }
const rooms = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Authentication/Dashboard Registration
  socket.on('register-user', ({ userId, username }) => {
    onlineUsers.set(socket.id, { userId, username });
    io.emit('online-users', Array.from(onlineUsers.values()));
  });

  // Direct Call Invocation
  socket.on('call-user', ({ targetUserId, callerId, callerName, roomId }) => {
    // Find target user's socket ID
    let targetSocketId = null;
    for (const [sId, user] of onlineUsers.entries()) {
      if (user.userId === targetUserId) {
        targetSocketId = sId;
        break;
      }
    }

    if (targetSocketId) {
      io.to(targetSocketId).emit('incoming-call', { callerId, callerName, roomId });
    }
  });

  socket.on('accept-call', ({ targetSocketId, roomId }) => {
      // Find socket id from user id
      let sId = null;
      for (const [id, user] of onlineUsers.entries()) {
          if (user.userId === targetSocketId) {
              sId = id; break;
          }
      }
      if (sId) {
          io.to(sId).emit('call-accepted', { roomId });
      }
  });

  socket.on('reject-call', ({ targetSocketId }) => {
      let sId = null;
      for (const [id, user] of onlineUsers.entries()) {
          if (user.userId === targetSocketId) {
              sId = id; break;
          }
      }
      if (sId) {
          io.to(sId).emit('call-rejected');
      }
  });


  // Existing Room Logic
  socket.on('join-room', (roomId) => {
    socket.join(roomId);
    
    if (!rooms.has(roomId)) {
      rooms.set(roomId, new Set());
    }
    const roomUsers = rooms.get(roomId);
    
    // Send existing users to the new user
    const usersInRoom = Array.from(roomUsers).filter(id => id !== socket.id);
    socket.emit('all-users', usersInRoom);

    roomUsers.add(socket.id);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    if (onlineUsers.has(socket.id)) {
      onlineUsers.delete(socket.id);
      io.emit('online-users', Array.from(onlineUsers.values()));
    }

    // Remove from rooms
    rooms.forEach((users, roomId) => {
      if (users.has(socket.id)) {
        users.delete(socket.id);
        if (users.size === 0) {
          rooms.delete(roomId);
        }
        socket.to(roomId).emit('user-disconnected', socket.id);
      }
    });
  });

  socket.on('offer', (payload) => {
    io.to(payload.target).emit('offer', {
      caller: payload.caller,
      offer: payload.offer
    });
  });

  socket.on('answer', (payload) => {
    io.to(payload.target).emit('answer', {
      target: socket.id,
      answer: payload.answer
    });
  });

  socket.on('ice-candidate', (payload) => {
    io.to(payload.target).emit('ice-candidate', {
      sender: socket.id,
      candidate: payload.candidate
    });
  });

  socket.on('chat-message', (payload) => {
    socket.to(payload.roomId).emit('chat-message', {
      senderId: socket.id,
      senderName: payload.senderName,
      text: payload.text,
      timestamp: Date.now(),
      fileUrl: payload.fileUrl,
      fileName: payload.fileName,
      fileType: payload.fileType
    });
  });
});

server.listen(PORT, () => {
  console.log(`Signaling & API server listening on port ${PORT}`);
});
