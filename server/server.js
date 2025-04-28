// server/server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: true,
    methods: ["GET", "POST"]
  }
});

// Serve the frontend build (optional if you deploy separately)
app.use(express.static(path.join(__dirname, '../dist')));

const PORT = process.env.PORT || 3000;

// Room management
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // When a player joins a room
  socket.on('joinRoom', (roomId) => {
    socket.join(roomId);
    console.log(`Player ${socket.id} joined room: ${roomId}`);

    // Assign player number based on current players in the room
    const players = io.sockets.adapter.rooms.get(roomId);
    let playerNumber = 1;
    if (players) {
      playerNumber = players.size; // 1 or 2
    }
    socket.emit('assignPlayerNumber', playerNumber);

    if (players.size === 2) {
      io.to(roomId).emit('startGame');
    }
  });

  // Handle dice rolling
  socket.on('rollDice', (data) => {
    io.to(data.roomId).emit('diceRolled', data);
  });

  // Handle tile shutting
  socket.on('shutTile', (data) => {
    io.to(data.roomId).emit('tileShut', data);
  });

  // Handle turn end
  socket.on('endTurn', (data) => {
    io.to(data.roomId).emit('nextTurn', data);
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected:', socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
