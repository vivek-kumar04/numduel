// components/GameScreen.jsx
// Main gameplay UI: player cards, guess input, history, chat, timer

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function GameScreen({
  room,
  myPlayer,
  currentPlayerId,
  isMyTurn,
  guessHistory,
  chat,
  hint,
  turnTimer,
  onSubmitGuess,
  onSendChat,
  error,
  hasSetNumber,
  onSetSecretNumber,
}) {
  const [guess, setGuess] = useState("");
  const [secretNumberInput, setSecretNumberInput] = useState("");
  const [chatMsg, setChatMsg] = useState("");
  const [chatOpen, setChatOpen] = useState(false);
  const chatEndRef = useRef(null);
  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  const handleSetSecret = () => {
    const val = parseInt(secretNumberInput);
    if (isNaN(val) || val < 1 || val > 100) return;
    onSetSecretNumber(val);
  };

  const handleGuess = () => {
    const val = parseInt(guess);
    if (isNaN(val) || val < 1 || val > 100) return;
    onSubmitGuess(val);
    setGuess("");
  };

  const handleChat = () => {
    if (!chatMsg.trim()) return;
    onSendChat(chatMsg.trim());
    setChatMsg("");
  };

  const currentPlayer = room?.players?.find((p) => p.id === currentPlayerId);
  const opponent = room?.players?.find((p) => p.id !== myPlayer?.id);

  const timerPct = (turnTimer / 30) * 100;
  const timerColor =
    turnTimer > 15 ? "#22c55e" : turnTimer > 7 ? "#f59e0b" : "#ef4444";

  const hintColors = {
    higher: { bg: "#fef3c7", text: "#92400e", icon: "⬆️", label: "HIGHER" },
    lower: { bg: "#dbeafe", text: "#1e40af", icon: "⬇️", label: "LOWER" },
    bingo: { bg: "#dcfce7", text: "#166534", icon: "🎉", label: "BINGO!" },
  };

  return (
    <div className="game-page">
      <div className="orb orb-1" />
      <div className="orb orb-2" />

      <div className="game-layout">
        {/* ── Top Bar ─────────────────────────────────────── */}
        <motion.div
          className="game-topbar"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="topbar-left">
            <span className="room-tag">🏠 {room?.id}</span>
            <span className="round-tag">Round {room?.round}</span>
          </div>
          <div className="topbar-title">NumDuel 🎯</div>
          <button
            className="chat-toggle-btn"
            onClick={() => setChatOpen((v) => !v)}
          >
            💬 {chat.length > 0 && <span className="chat-badge">{chat.length}</span>}
          </button>
        </motion.div>

        <div className="game-main">
          {/* ── Left: Game Panel ─────────────────────────── */}
          <div className="game-center">
            {/* Players */}
            <div className="players-row">
              {room?.players?.map((p, i) => {
                const isActive = p.id === currentPlayerId;
                const isMe = p.id === myPlayer?.id;
                return (
                  <motion.div
                    key={p.id}
                    className={`player-card ${isActive ? "player-active" : ""} ${isMe ? "player-me" : ""}`}
                    animate={isActive ? { scale: [1, 1.03, 1] } : {}}
                    transition={{ duration: 1.5, repeat: isActive ? Infinity : 0 }}
                  >
                    <div className="player-card-avatar">{p.avatar}</div>
                    <div className="player-card-name">
                      {p.username} {isMe && <span className="you-tag">(You)</span>}
                    </div>
                    <div className="player-card-score">
                      🏆 {room?.scores?.[p.username] || 0}
                    </div>
                    {room?.status === "playing" && isActive && (
                      <motion.div
                        className="turn-indicator"
                        animate={{ opacity: [1, 0.5, 1] }}
                        transition={{ duration: 0.8, repeat: Infinity }}
                      >
                        YOUR TURN
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            </div>

            {/* Timer */}
            {room?.status === "playing" && (
              <div className="timer-row">
                <div className="timer-bar-bg">
                  <motion.div
                    className="timer-bar-fill"
                    style={{ background: timerColor }}
                    animate={{ width: `${timerPct}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <span className="timer-num" style={{ color: timerColor }}>
                  {turnTimer}s
                </span>
              </div>
            )}

            {/* Hint display */}
            <AnimatePresence mode="wait">
              {hint && (
                <motion.div
                  key={`${hint.guess}-${hint.hint}`}
                  className="hint-banner"
                  style={{
                    background: hintColors[hint.hint]?.bg,
                    color: hintColors[hint.hint]?.text,
                  }}
                  initial={{ opacity: 0, scale: 0.8, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                >
                  <span className="hint-icon">{hintColors[hint.hint]?.icon}</span>
                  <span>
                    <strong>{hint.player}</strong> guessed{" "}
                    <strong>{hint.guess}</strong> —{" "}
                    <strong>{hintColors[hint.hint]?.label}</strong>
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Phase: Setting Numbers */}
            <AnimatePresence>
              {room?.status === "setting_numbers" && (
                <motion.div
                  className="guess-panel"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                >
                  {!hasSetNumber ? (
                    <>
                      <p className="guess-label">
                        🤔 Choose a secret number (1–100) for your opponent to guess!
                      </p>
                      <div className="guess-input-row">
                        <input
                          className="guess-input"
                          type="number"
                          min={1}
                          max={100}
                          placeholder="?"
                          value={secretNumberInput}
                          onChange={(e) => setSecretNumberInput(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleSetSecret()}
                          autoFocus
                        />
                        <motion.button
                          className="btn-guess"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleSetSecret}
                          disabled={!secretNumberInput}
                        >
                          🔒 Set Number
                        </motion.button>
                      </div>
                    </>
                  ) : (
                    <div className="waiting-turn">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        className="spin-icon"
                      >
                        ⏳
                      </motion.div>
                      <span>Waiting for opponent to choose…</span>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Guess Input */}
            <AnimatePresence>
              {room?.status === "playing" && isMyTurn && (
                <motion.div
                  className="guess-panel"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                >
                  <p className="guess-label">
                    🎯 Your turn! Guess a number between 1–100
                  </p>
                  <div className="guess-input-row">
                    <input
                      className="guess-input"
                      type="number"
                      min={1}
                      max={100}
                      placeholder="?"
                      value={guess}
                      onChange={(e) => setGuess(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleGuess()}
                      autoFocus
                    />
                    <motion.button
                      className="btn-guess"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleGuess}
                      disabled={!guess}
                    >
                      🚀 Guess
                    </motion.button>
                  </div>

                  {/* Quick pick buttons */}
                  <div className="quick-picks">
                    {[10, 25, 50, 75, 90].map((n) => (
                      <button
                        key={n}
                        className="quick-btn"
                        onClick={() => setGuess(String(n))}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {room?.status === "playing" && !isMyTurn && (
                <motion.div
                  className="waiting-turn"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="spin-icon"
                  >
                    ⏳
                  </motion.div>
                  <span>Waiting for {currentPlayer?.username}…</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  className="error-banner"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  ⚠️ {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Guess history */}
            <div className="history-panel">
              <h3 className="history-title">📜 Guess History</h3>
              <div className="history-list">
                <AnimatePresence>
                  {guessHistory.length === 0 && (
                    <p className="history-empty">No guesses yet…</p>
                  )}
                  {guessHistory.map((entry, i) => (
                    <motion.div
                      key={i}
                      className={`history-item hint-${entry.hint}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0 }}
                    >
                      <span className="h-avatar">{entry.avatar}</span>
                      <span className="h-name">{entry.player}</span>
                      <span className="h-guess">{entry.guess}</span>
                      <span className="h-hint">
                        {entry.hint === "higher"
                          ? "⬆️ Higher"
                          : entry.hint === "lower"
                          ? "⬇️ Lower"
                          : "🎉 Bingo!"}
                      </span>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* ── Right: Chat Panel ─────────────────────────── */}
          <AnimatePresence>
            {chatOpen && (
              <motion.div
                className="chat-panel"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 40 }}
              >
                <h3 className="chat-title">💬 Chat</h3>
                <div className="chat-messages">
                  {chat.map((c, i) => (
                    <div
                      key={i}
                      className={`chat-msg ${c.player === myPlayer?.username ? "chat-mine" : "chat-theirs"}`}
                    >
                      <span className="chat-avatar">{c.avatar}</span>
                      <div className="chat-bubble">
                        <span className="chat-sender">{c.player}</span>
                        <span className="chat-text">{c.message}</span>
                      </div>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>
                <div className="chat-input-row">
                  <input
                    className="chat-input"
                    type="text"
                    placeholder="Say something…"
                    value={chatMsg}
                    onChange={(e) => setChatMsg(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleChat()}
                    maxLength={200}
                  />
                  <button className="chat-send-btn" onClick={handleChat}>
                    ➤
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
