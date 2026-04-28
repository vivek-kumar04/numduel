# 🎯 NumDuel — Real-Time Multiplayer Number Guessing Game

A polished, premium real-time 1v1 number guessing game built with React, Node.js, and Socket.IO.

---

## ✨ Features

- **Real-time multiplayer** via Socket.IO WebSockets
- **Room system** with unique 6-char codes (create / join)
- **Turn-based gameplay** with a 30-second countdown timer
- **Hint system**: Higher / Lower / Bingo!
- **In-game chat** panel
- **Multi-round scoreboard** with rematch
- **Winner celebration** (confetti + bear GIF)
- **Loser teasing** (funny bear GIF + message)
- **Responsive** for desktop & mobile
- **Cosmic candy** dark theme with neon accents

---

## 🗂 Folder Structure

```
numduel/
├── server/
│   ├── index.js          # Express + Socket.IO game server
│   └── package.json
├── client/
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── App.jsx               # Root screen router
│       ├── index.js              # React entry point
│       ├── styles.css            # Global premium styles
│       ├── hooks/
│       │   ├── useSocket.js      # Socket.IO connection
│       │   └── useGame.js        # Central game state
│       └── components/
│           ├── HomePage.jsx      # Username + create/join
│           ├── WaitingRoom.jsx   # Lobby with room code
│           ├── GameScreen.jsx    # Main gameplay UI
│           ├── ResultScreen.jsx  # Winner/loser + confetti
│           └── Notification.jsx  # Toast notifications
└── package.json
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm 8+

### 1. Install dependencies

```bash
# From root
npm run install:all
# OR manually:
cd server && npm install
cd ../client && npm install
```

### 2. Run the server

```bash
cd server
npm run dev       # dev (nodemon)
# or
npm start         # production
```

Server runs on **http://localhost:3001**

### 3. Run the client

```bash
cd client
npm start
```

Client runs on **http://localhost:3000**

### 4. Play!

1. Open **http://localhost:3000** in two browser windows (or share the link)
2. Player 1 enters a name → **Create Room** → shares the code
3. Player 2 enters a name → **Join Room** → enters the code
4. Game starts automatically — take turns guessing 1–100!

---

## 🌐 Environment Variables

### Client (`client/.env`)
```
REACT_APP_SERVER_URL=http://localhost:3001
```

For production, set this to your deployed server URL.

### Server
```
PORT=3001
```

---

## ☁️ Deployment

### Deploy Server (Railway / Render / Fly.io)

1. Push `server/` directory
2. Set `PORT` env var
3. Start command: `node index.js`

### Deploy Client (Vercel / Netlify)

1. Set `REACT_APP_SERVER_URL` to your deployed server URL
2. Build: `npm run build`
3. Deploy the `build/` folder

---

## 🎮 Game Rules

1. A secret number (1–100) is chosen when the game starts
2. Players alternate guessing — Player 1 goes first
3. After each guess, you see: **Higher** ⬆️, **Lower** ⬇️, or **Bingo!** 🎉
4. You have **30 seconds** per turn — if you time out, your turn is skipped
5. First player to guess correctly wins the round
6. Play multiple rounds and track scores on the scoreboard

---

## 🧪 Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18 |
| Animations | Framer Motion |
| Real-time | Socket.IO 4 |
| Backend | Node.js + Express |
| State | React Hooks |
| Styling | Custom CSS (no framework) |

---

## 📝 License

MIT — use freely!
