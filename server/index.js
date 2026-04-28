/**
 * Number Guessing Game - Real-time Multiplayer Server
 * Built with Express + Socket.IO
 */

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");

const app = express();
const server = http.createServer(app);

// ─── Socket.IO Setup ──────────────────────────────────────────────────────────
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());

// ─── In-memory Room Store ─────────────────────────────────────────────────────
/**
 * rooms: Map<roomId, RoomState>
 * RoomState: {
 *   id: string,
 *   players: [{ id, username, score, avatar }],
 *   secretNumber: number,
 *   currentTurnIndex: number,
 *   guessHistory: [{ player, guess, hint, timestamp }],
 *   chat: [{ player, message, timestamp }],
 *   status: 'waiting' | 'playing' | 'finished',
 *   winner: string | null,
 *   round: number,
 *   scores: { [username]: number },
 *   turnTimer: null | NodeJS.Timeout,
 *   turnStartTime: number | null,
 * }
 */
const rooms = new Map();

const TURN_TIMEOUT_MS = 30000; // 30 seconds per turn
const AVATARS = ["🐼", "🦊", "🐸", "🐯", "🦁", "🐺", "🐻", "🐨"];

// ─── Helper Functions ─────────────────────────────────────────────────────────

/** Generate a random 6-char uppercase room code */
function generateRoomCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

/** Pick a random secret number 1–100 */
function generateSecretNumber() {
  return Math.floor(Math.random() * 100) + 1;
}

/** Get hint for a guess */
function getHint(guess, secret) {
  if (guess === secret) return "bingo";
  return guess < secret ? "higher" : "lower";
}

/** Clear turn timer for a room */
function clearTurnTimer(room) {
  if (room.turnTimer) {
    clearTimeout(room.turnTimer);
    room.turnTimer = null;
  }
}

/** Start a turn timer — auto-advance if player doesn't guess */
function startTurnTimer(roomId) {
  const room = rooms.get(roomId);
  if (!room || room.status !== "playing") return;

  clearTurnTimer(room);
  room.turnStartTime = Date.now();

  room.turnTimer = setTimeout(() => {
    const r = rooms.get(roomId);
    if (!r || r.status !== "playing") return;

    // Auto-skip turn
    const skippedPlayer = r.players[r.currentTurnIndex];
    r.currentTurnIndex = (r.currentTurnIndex + 1) % r.players.length;

    io.to(roomId).emit("turn_skipped", {
      skippedPlayer: skippedPlayer.username,
      nextPlayer: r.players[r.currentTurnIndex].username,
    });

    io.to(roomId).emit("turn_change", {
      currentPlayer: r.players[r.currentTurnIndex].username,
      currentPlayerId: r.players[r.currentTurnIndex].id,
    });

    startTurnTimer(roomId);
  }, TURN_TIMEOUT_MS);
}

// ─── Socket.IO Event Handlers ─────────────────────────────────────────────────
io.on("connection", (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`);

  // ── Create Room ──
  socket.on("create_room", ({ username }) => {
    const roomId = generateRoomCode();
    const avatarIndex = Math.floor(Math.random() * AVATARS.length);
    const player = {
      id: socket.id,
      username,
      avatar: AVATARS[avatarIndex],
      score: 0,
    };

    const room = {
      id: roomId,
      players: [player],
      secretNumbers: {},
      currentTurnIndex: 0,
      guessHistory: [],
      chat: [],
      status: "waiting",
      winner: null,
      round: 1,
      scores: { [username]: 0 },
      turnTimer: null,
      turnStartTime: null,
    };

    rooms.set(roomId, room);
    socket.join(roomId);
    socket.data.roomId = roomId;
    socket.data.username = username;

    socket.emit("room_created", { roomId, player, room: sanitizeRoom(room) });
    console.log(`🏠 Room ${roomId} created by ${username}`);
  });

  // ── Join Room ──
  socket.on("join_room", ({ username, roomId }) => {
    const room = rooms.get(roomId);

    if (!room) {
      socket.emit("error", { message: "Room not found. Check the room code!" });
      return;
    }
    if (room.players.length >= 2) {
      socket.emit("error", { message: "Room is full. Try a different room!" });
      return;
    }
    if (room.status === "finished") {
      socket.emit("error", { message: "Game already finished in this room!" });
      return;
    }

    // Assign a different avatar than player 1
    const takenAvatarIndex = AVATARS.indexOf(room.players[0].avatar);
    let avatarIndex;
    do {
      avatarIndex = Math.floor(Math.random() * AVATARS.length);
    } while (avatarIndex === takenAvatarIndex);

    const player = {
      id: socket.id,
      username,
      avatar: AVATARS[avatarIndex],
      score: 0,
    };

    room.players.push(player);
    room.scores[username] = 0;
    socket.join(roomId);
    socket.data.roomId = roomId;
    socket.data.username = username;

    // Notify the joining player specifically
    socket.emit("room_joined", {
      player,
      room: sanitizeRoom(room),
    });

    // Notify other players
    socket.to(roomId).emit("player_joined", {
      player,
      room: sanitizeRoom(room),
    });

    // Start setting numbers phase
    room.status = "setting_numbers";
    room.secretNumbers = {};

    console.log(
      `🔢 Setting numbers phase in room ${roomId}`
    );

    io.to(roomId).emit("setting_numbers", {
      room: sanitizeRoom(room),
    });
  });

  // ── Set Secret Number ──
  socket.on("set_secret_number", ({ roomId, number }) => {
    const room = rooms.get(roomId);
    if (!room || room.status !== "setting_numbers") return;

    const parsedNumber = parseInt(number, 10);
    if (isNaN(parsedNumber) || parsedNumber < 1 || parsedNumber > 100) {
      socket.emit("error", { message: "Number must be between 1 and 100!" });
      return;
    }

    room.secretNumbers[socket.id] = parsedNumber;

    if (Object.keys(room.secretNumbers).length === 2) {
      room.status = "playing";
      room.currentTurnIndex = 0;
      io.to(roomId).emit("game_start", {
        room: sanitizeRoom(room),
        currentPlayer: room.players[0].username,
        currentPlayerId: room.players[0].id,
      });
      startTurnTimer(roomId);
    }
  });

  // ── Submit Guess ──
  socket.on("submit_guess", ({ roomId, guess }) => {
    const room = rooms.get(roomId);
    if (!room || room.status !== "playing") return;

    const currentPlayer = room.players[room.currentTurnIndex];
    if (currentPlayer.id !== socket.id) {
      socket.emit("error", { message: "It's not your turn!" });
      return;
    }

    const parsedGuess = parseInt(guess, 10);
    if (isNaN(parsedGuess) || parsedGuess < 1 || parsedGuess > 100) {
      socket.emit("error", { message: "Guess must be between 1 and 100!" });
      return;
    }

    clearTurnTimer(room);

    const opponent = room.players.find((p) => p.id !== socket.id);
    const secretToGuess = room.secretNumbers[opponent.id];
    const hint = getHint(parsedGuess, secretToGuess);
    const guessEntry = {
      player: currentPlayer.username,
      avatar: currentPlayer.avatar,
      guess: parsedGuess,
      hint,
      timestamp: Date.now(),
    };

    room.guessHistory.push(guessEntry);

    if (hint === "bingo") {
      // ── Winner! ──
      room.status = "finished";
      room.winner = currentPlayer.username;
      room.scores[currentPlayer.username] =
        (room.scores[currentPlayer.username] || 0) + 1;

      io.to(roomId).emit("guess_result", guessEntry);
      io.to(roomId).emit("game_over", {
        winner: currentPlayer.username,
        winnerId: currentPlayer.id,
        secretNumbers: room.secretNumbers,
        scores: room.scores,
        guessHistory: room.guessHistory,
      });

      console.log(
        `🏆 ${currentPlayer.username} won room ${roomId} — secret was ${room.secretNumber}`
      );
    } else {
      // ── Next turn ──
      room.currentTurnIndex =
        (room.currentTurnIndex + 1) % room.players.length;
      const nextPlayer = room.players[room.currentTurnIndex];

      io.to(roomId).emit("guess_result", guessEntry);
      io.to(roomId).emit("turn_change", {
        currentPlayer: nextPlayer.username,
        currentPlayerId: nextPlayer.id,
      });

      startTurnTimer(roomId);
    }
  });

  // ── Chat Message ──
  socket.on("send_chat", ({ roomId, message }) => {
    const room = rooms.get(roomId);
    if (!room) return;

    const player = room.players.find((p) => p.id === socket.id);
    if (!player) return;

    const chatEntry = {
      player: player.username,
      avatar: player.avatar,
      message: message.substring(0, 200), // cap message length
      timestamp: Date.now(),
    };

    room.chat.push(chatEntry);
    io.to(roomId).emit("chat_message", chatEntry);
  });

  // ── Request Rematch ──
  socket.on("request_rematch", ({ roomId }) => {
    const room = rooms.get(roomId);
    if (!room) return;

    const player = room.players.find((p) => p.id === socket.id);
    if (!player) return;

    if (!room.rematchRequests) room.rematchRequests = new Set();
    room.rematchRequests.add(socket.id);

    // Broadcast who requested
    io.to(roomId).emit("rematch_requested", { player: player.username });

    if (room.rematchRequests.size >= 2) {
      room.status = "setting_numbers";
      room.secretNumbers = {};
      room.currentTurnIndex = 0;
      room.guessHistory = [];
      room.winner = null;
      room.round += 1;
      room.rematchRequests = new Set();
      clearTurnTimer(room);

      io.to(roomId).emit("setting_numbers", {
        room: sanitizeRoom(room)
      });
      console.log(`🔄 Rematch: Setting numbers in room ${roomId}`);
    }
  });

  // ── Disconnect ──
  socket.on("disconnect", () => {
    const roomId = socket.data.roomId;
    const username = socket.data.username;

    if (roomId) {
      const room = rooms.get(roomId);
      if (room) {
        clearTurnTimer(room);
        io.to(roomId).emit("player_disconnected", { username });

        // Clean up room after a delay (allow reconnect)
        setTimeout(() => {
          const r = rooms.get(roomId);
          if (r && r.players.every((p) => !io.sockets.sockets.get(p.id))) {
            rooms.delete(roomId);
            console.log(`🗑️  Room ${roomId} cleaned up`);
          }
        }, 60000);
      }
    }

    console.log(`❌ Client disconnected: ${socket.id} (${username})`);
  });
});

// ─── Sanitize Room (remove secret number) ────────────────────────────────────
function sanitizeRoom(room) {
  const { secretNumbers, turnTimer, ...safe } = room;
  return safe;
}

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get("/health", (req, res) => {
  res.json({ status: "ok", rooms: rooms.size });
});

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
