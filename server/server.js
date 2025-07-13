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
    origin: "https://shut-the-9fjkpauyt-ashaku7s-projects.vercel.app",
    methods: ["GET", "POST"]
  }
});

// Serve the frontend build (optional if you deploy separately)
app.use(express.static(path.join(__dirname, '../dist')));

const PORT = process.env.PORT || 3000;

// Add a mapping from socket.id to player number for each room
const roomPlayers = {};

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
    // Track which socket is which player in the room
    if (!roomPlayers[roomId]) roomPlayers[roomId] = {};
    roomPlayers[roomId][playerNumber] = socket.id;
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
    console.log('Received rollDice event:', data);
    const roomState = roomStates[data.roomId];
    if (!roomState) {
        console.log('No room state found for roomId:', data.roomId);
        return;
    }

    const currentPlayer = roomState.currentPlayer;
    // Validate that the socket is the current player
    if (!roomPlayers[data.roomId] || roomPlayers[data.roomId][currentPlayer] !== socket.id) {
      console.log('rollDice rejected: not current player');
      return;
    }
    console.log(`Processing roll for Player ${currentPlayer}, diceTotal: ${data.diceTotal}`);

    // Get available tiles for current player
    const shutTilesSet = roomState.shutTiles[currentPlayer];
    const availableTiles = [];
    for (let i = 1; i <= 9; i++) {
        if (!shutTilesSet.has(i)) {
            availableTiles.push(i);
        }
    }
    console.log(`Player ${currentPlayer} shutTiles:`, Array.from(shutTilesSet));
    console.log(`Player ${currentPlayer} availableTiles:`, availableTiles);
    console.log(`Available tiles for Player ${currentPlayer}:`, availableTiles);

    // Check if player can shut tiles for the roll
    const canShut = canSumToTarget(availableTiles, data.diceTotal);
    console.log(`Can Player ${currentPlayer} shut tiles for roll ${data.diceTotal}?`, canShut);

    // Always emit diceRolled with canShut flag
    io.to(data.roomId).emit('diceRolled', {
      diceTotal: data.diceTotal,
      currentPlayer: currentPlayer,
      canShut: canShut
    });

    if (!canShut) {
        console.log(`No valid moves for Player ${currentPlayer}, switching turns`);
        // Switch to next player
        roomState.currentPlayer = currentPlayer === 1 ? 2 : 1;
        console.log(`Turn switched to Player ${roomState.currentPlayer}`);
        
        // Emit nextTurn event immediately
        io.to(data.roomId).emit('nextTurn', {
            nextPlayer: roomState.currentPlayer,
            previousPlayer: currentPlayer,
            reason: 'no_valid_moves'
        });
        return;
    }

    // If player can shut tiles, do nothing else (wait for shutTile/endTurn)
  });

  // Handle tile shutting
  socket.on('shutTile', (data) => {
    console.log('Received shutTile event:', data);
    const roomState = roomStates[data.roomId];
    if (!roomState) {
      console.log('No room state found for roomId:', data.roomId);
      return;
    }

    const currentPlayer = roomState.currentPlayer;
    // Validate that the socket is the current player
    if (!roomPlayers[data.roomId] || roomPlayers[data.roomId][currentPlayer] !== socket.id) {
      console.log('shutTile rejected: not current player');
      return;
    }

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

    console.log(`Player ${player} shut tiles:`, Array.from(roomState.shutTiles[player]));
    console.log(`Current player: ${roomState.currentPlayer}`);

    io.to(data.roomId).emit('tileShut', data);

    // Check if player has shut all tiles
    if (allTilesShut(roomState.shutTiles[player])) {
      io.to(data.roomId).emit('gameOver', { message: `Player ${player} has shut all tiles and wins!` });
    }
  });

  // Handle turn end
  socket.on('endTurn', (data) => {
    console.log('Received endTurn event:', data);
    const roomState = roomStates[data.roomId];
    if (!roomState) {
        console.log('No room state found for roomId:', data.roomId);
        return;
    }

    // Verify the current player matches before switching turns
    if (roomState.currentPlayer !== data.currentPlayer) {
        console.log(`Turn switch rejected - current player mismatch. Expected: ${roomState.currentPlayer}, Got: ${data.currentPlayer}`);
        return;
    }

    // Switch current player
    const previousPlayer = roomState.currentPlayer;
    roomState.currentPlayer = roomState.currentPlayer === 1 ? 2 : 1;
    
    console.log(`Turn switched from Player ${previousPlayer} to Player ${roomState.currentPlayer}`);
    console.log(`Reason for turn switch: ${data.reason || 'normal_turn_end'}`);
    console.log(`Player 1 shut tiles:`, Array.from(roomState.shutTiles[1]));
    console.log(`Player 2 shut tiles:`, Array.from(roomState.shutTiles[2]));
    
    // Emit nextTurn event to all clients in the room
    io.to(data.roomId).emit('nextTurn', { 
        nextPlayer: roomState.currentPlayer,
        previousPlayer: previousPlayer,
        reason: data.reason || 'normal_turn_end'
    });
  });

  // --- Multiplayer Chat Relay ---
  socket.on('chatMessage', (data) => {
    // Determine sender (Player 1 or 2)
    let sender = 'Player';
    if (roomPlayers[data.roomId]) {
      sender = Object.entries(roomPlayers[data.roomId]).find(([num, id]) => id === socket.id);
      sender = sender ? `Player ${sender[0]}` : 'Player';
    }
    // Broadcast to everyone in the room except the sender
    socket.to(data.roomId).emit('chatMessage', {
      sender: sender,
      message: data.message
    });
  });
  // --- Typing Indicator Relay ---
  socket.on('typing', (data) => {
    socket.to(data.roomId).emit('typing');
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected:', socket.id);
    // Remove socket from roomPlayers
    for (const roomId in roomPlayers) {
      for (const playerNum in roomPlayers[roomId]) {
        if (roomPlayers[roomId][playerNum] === socket.id) {
          delete roomPlayers[roomId][playerNum];
        }
      }
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
