// components/HomePage.jsx
// Landing page: username entry + create/join room

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function HomePage({ onCreateRoom, onJoinRoom, error }) {
  const [username, setUsername] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [mode, setMode] = useState(null); // 'create' | 'join'

  const handleCreate = () => {
    if (!username.trim()) return;
    onCreateRoom(username.trim());
  };

  const handleJoin = () => {
    if (!username.trim() || !roomCode.trim()) return;
    onJoinRoom(username.trim(), roomCode.trim());
  };

  return (
    <div className="home-page">
      {/* Floating orbs */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      <motion.div
        className="home-card"
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Logo */}
        <div className="logo-section">
          <motion.div
            className="logo-icon"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            🎯
          </motion.div>
          <h1 className="logo-title">NumDuel</h1>
          <p className="logo-sub">Real-time 1v1 number guessing battle</p>
        </div>

        {/* Stars decoration */}
        <div className="stars">
          {[...Array(6)].map((_, i) => (
            <motion.span
              key={i}
              className="star"
              style={{ left: `${10 + i * 15}%`, top: `${Math.random() * 30}%` }}
              animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
              transition={{ duration: 2 + i * 0.3, repeat: Infinity, delay: i * 0.2 }}
            >
              ✦
            </motion.span>
          ))}
        </div>

        {/* Username input */}
        <div className="input-group">
          <label className="input-label">Your Name</label>
          <div className="input-wrapper">
            <span className="input-icon">👤</span>
            <input
              className="text-input"
              type="text"
              placeholder="Enter your name..."
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              maxLength={20}
              onKeyDown={(e) => {
                if (e.key === "Enter" && mode === "create") handleCreate();
                if (e.key === "Enter" && mode === "join") handleJoin();
              }}
              autoFocus
            />
          </div>
        </div>

        {/* Mode selector */}
        <AnimatePresence mode="wait">
          {!mode && (
            <motion.div
              key="buttons"
              className="mode-buttons"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <motion.button
                className="btn btn-create"
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setMode("create")}
                disabled={!username.trim()}
              >
                <span className="btn-icon">🏠</span>
                <span>
                  <strong>Create Room</strong>
                  <small>Start a new game</small>
                </span>
              </motion.button>

              <motion.button
                className="btn btn-join"
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setMode("join")}
                disabled={!username.trim()}
              >
                <span className="btn-icon">🚪</span>
                <span>
                  <strong>Join Room</strong>
                  <small>Enter a room code</small>
                </span>
              </motion.button>
            </motion.div>
          )}

          {mode === "create" && (
            <motion.div
              key="create"
              className="action-panel"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <p className="panel-hint">
                A unique room code will be generated for you to share.
              </p>
              <div className="panel-actions">
                <motion.button
                  className="btn btn-confirm"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleCreate}
                >
                  🚀 Create My Room
                </motion.button>
                <button className="btn-ghost" onClick={() => setMode(null)}>
                  ← Back
                </button>
              </div>
            </motion.div>
          )}

          {mode === "join" && (
            <motion.div
              key="join"
              className="action-panel"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <div className="input-group">
                <label className="input-label">Room Code</label>
                <div className="input-wrapper">
                  <span className="input-icon">🔑</span>
                  <input
                    className="text-input text-upper"
                    type="text"
                    placeholder="e.g. ABC123"
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                    maxLength={6}
                    onKeyDown={(e) => e.key === "Enter" && handleJoin()}
                    autoFocus
                  />
                </div>
              </div>
              <div className="panel-actions">
                <motion.button
                  className="btn btn-confirm"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleJoin}
                  disabled={roomCode.length < 4}
                >
                  🎮 Join Game
                </motion.button>
                <button className="btn-ghost" onClick={() => setMode(null)}>
                  ← Back
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              className="error-banner"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
            >
              ⚠️ {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer hint */}
        <p className="home-footer">
          No account needed · Instant play · Invite a friend!
        </p>
      </motion.div>
    </div>
  );
}
