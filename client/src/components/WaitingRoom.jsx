// components/WaitingRoom.jsx
// Shown to the room creator while waiting for another player

import { motion } from "framer-motion";

export default function WaitingRoom({ room, myPlayer, onGoHome }) {
  const handleCopy = () => {
    navigator.clipboard.writeText(room?.id || "");
  };

  return (
    <div className="waiting-page">
      <div className="orb orb-1" />
      <div className="orb orb-2" />

      <motion.div
        className="waiting-card"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Pulsing bear */}
        <motion.div
          className="waiting-bear"
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        >
          🐻
        </motion.div>

        <h2 className="waiting-title">Waiting for opponent…</h2>
        <p className="waiting-sub">Share your room code with a friend!</p>

        {/* Room code display */}
        <motion.div
          className="room-code-box"
          whileHover={{ scale: 1.02 }}
          onClick={handleCopy}
          title="Click to copy"
        >
          <span className="room-code-label">Room Code</span>
          <span className="room-code-value">{room?.id}</span>
          <span className="room-code-copy">📋 Copy</span>
        </motion.div>

        {/* Animated dots */}
        <div className="waiting-dots">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="dot"
              animate={{ scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.3 }}
            />
          ))}
        </div>

        {/* Players */}
        <div className="players-preview">
          {room?.players?.map((p, i) => (
            <motion.div
              key={p.id}
              className="player-chip"
              initial={{ opacity: 0, x: i === 0 ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
            >
              <span className="player-avatar">{p.avatar}</span>
              <span className="player-name">{p.username}</span>
              {i === 0 && <span className="player-badge">Host</span>}
            </motion.div>
          ))}

          {(!room?.players || room.players.length < 2) && (
            <motion.div
              className="player-chip player-empty"
              animate={{ opacity: [0.4, 0.8, 0.4] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <span className="player-avatar">❓</span>
              <span className="player-name">Waiting…</span>
            </motion.div>
          )}
        </div>

        <button className="btn-ghost mt-4" onClick={onGoHome}>
          ← Leave Room
        </button>
      </motion.div>
    </div>
  );
}
