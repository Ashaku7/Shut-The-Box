// server/server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const roomStates = {};

const io = new Server(server, {
  cors: {
    origin: true,
    methods: ["GET", "POST"]
  }
});

// Serve the frontend build (optional if you deploy separately)
app.use(express.static(path.join(__dirname, '../dist')));

const PORT = process.env.PORT || 3000;

// Helper function to check if all tiles 1-9 are shut
function allTilesShut(shutTiles) {
  for (let i = 1; i <= 9; i++) {
    if (!shutTiles.has(i)) {
      return false;
    }
  }
  return true;
}

// Helper function to check if any combination of available tiles sums to target
function canSumToTarget(numbers, target) {
  const memo = new Map();

  function backtrack(start, sum) {
    const key = `${start},${sum}`;
    if (memo.has(key)) return memo.get(key);
    if (sum === target) return true;
    if (sum > target) return false;
    for (let i = start; i < numbers.length; i++) {
      if (backtrack(i + 1, sum + numbers[i])) {
        memo.set(key, true);
        return true;
      }
    }
    memo.set(key, false);
    return false;
  }
  return backtrack(0, 0);
}

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
      // Initialize room state with tile shut sets
      roomStates[roomId] = {
        currentPlayer: 1,
        playerScores: { 1: 0, 2: 0 },
        shutTiles: { 1: new Set(), 2: new Set() }
      };
      io.to(roomId).emit('startGame');
    }
  });

  // Handle dice rolling
  socket.on('rollDice', (data) => {
    const roomState = roomStates[data.roomId];
    if (!roomState) return;

    const currentPlayer = roomState.currentPlayer;
    const shutTilesSet = roomState.shutTiles[currentPlayer];
    // Get available tiles for current player
    const availableTiles = [];
    for (let i = 1; i <= 9; i++) {
      if (!shutTilesSet.has(i)) {
        availableTiles.push(i);
      }
    }

    // Check if player can shut tiles for the roll
    if (!canSumToTarget(availableTiles, data.diceTotal)) {
      // Pass turn to next player
      roomState.currentPlayer = currentPlayer === 1 ? 2 : 1;
      io.to(data.roomId).emit('nextTurn', { nextPlayer: roomState.currentPlayer });
      return;
    }

    io.to(data.roomId).emit('diceRolled', {
      diceTotal: data.diceTotal,
      currentPlayer: currentPlayer
    });
  });

  // Handle tile shutting
  socket.on('shutTile', (data) => {
    const roomState = roomStates[data.roomId];
    if (!roomState) return;

    const player = data.player;
    const tileValue = data.tileValue;

    // Update shut tiles set
    if (!roomState.shutTiles[player]) {
      roomState.shutTiles[player] = new Set();
    }
    roomState.shutTiles[player].add(tileValue);

    // Update player score
    if (!roomState.playerScores[player]) {
      roomState.playerScores[player] = 0;
    }
    roomState.playerScores[player] += tileValue;

    io.to(data.roomId).emit('tileShut', data);

    // Check if player has shut all tiles
    if (allTilesShut(roomState.shutTiles[player])) {
      io.to(data.roomId).emit('gameOver', { message: `Player ${player} has shut all tiles and wins!` });
    }
  });

  // Handle turn end
  socket.on('endTurn', (data) => {
    const roomState = roomStates[data.roomId];
    if (!roomState) return;
    // Switch current player
    roomState.currentPlayer = roomState.currentPlayer === 1 ? 2 : 1;
    io.to(data.roomId).emit('nextTurn', { nextPlayer: roomState.currentPlayer });
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected:', socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
