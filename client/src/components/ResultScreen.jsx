// components/ResultScreen.jsx
// Winner/loser experience with confetti, GIFs, scoreboard

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";

export default function ResultScreen({
  gameResult,
  myPlayer,
  room,
  rematchStatus,
  onRematch,
  onGoHome,
}) {
  const hasLaunched = useRef(false);
  const isWinner = gameResult?.winnerId === myPlayer?.id;

  // ── Confetti for winner ──────────────────────────────────────────────────
  useEffect(() => {
    if (isWinner && !hasLaunched.current) {
      hasLaunched.current = true;

      const end = Date.now() + 4000;
      const colors = ["#f43f5e", "#fb923c", "#facc15", "#4ade80", "#60a5fa", "#c084fc"];

      const frame = () => {
        if (Date.now() > end) return;
        confetti({
          particleCount: 6,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors,
        });
        confetti({
          particleCount: 6,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors,
        });
        requestAnimationFrame(frame);
      };
      frame();

      // Center burst
      setTimeout(() => {
        confetti({
          particleCount: 150,
          spread: 100,
          origin: { y: 0.5 },
          colors,
          scalar: 1.2,
        });
      }, 300);
    }
  }, [isWinner]);

  if (!gameResult) return null;

  return (
    <div className="result-page">
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      <motion.div
        className="result-card"
        initial={{ opacity: 0, scale: 0.8, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Main result */}
        {isWinner ? (
          <>
            <motion.div
              className="result-emoji"
              animate={{ rotate: [0, 15, -15, 0], scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              🏆
            </motion.div>
            <h1 className="result-title winner-title">You Win!</h1>
            <p className="result-sub">🎉 Bingo! You cracked the number!</p>

            {/* Winner bear animation */}
            <div className="result-bear">
              <img
                src="https://media.tenor.com/7-xJnBb7BVMAAAAC/happy-bear-teddy.gif"
                alt="Happy teddy bear"
                className="bear-gif"
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.nextSibling.style.display = "block";
                }}
              />
              <div className="bear-fallback" style={{ display: "none" }}>
                <motion.div
                  className="big-emoji"
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                >
                  🧸🎉
                </motion.div>
              </div>
            </div>
          </>
        ) : (
          <>
            <motion.div
              className="result-emoji"
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              😅
            </motion.div>
            <h1 className="result-title loser-title">So Close!</h1>
            <p className="result-sub">
              😜 Better luck next time! {gameResult.winner} got it!
            </p>

            {/* Teasing bear */}
            <div className="result-bear">
              <img
                src="https://media.tenor.com/6DSJFkGiDmgAAAAC/laughing-teddy-bear.gif"
                alt="Teasing teddy bear"
                className="bear-gif"
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.nextSibling.style.display = "block";
                }}
              />
              <div className="bear-fallback" style={{ display: "none" }}>
                <motion.div className="big-emoji">🧸😜</motion.div>
              </div>
            </div>
          </>
        )}

        {/* Secret number reveal */}
        <motion.div
          className="secret-reveal"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, type: "spring" }}
        >
          <span className="secret-label">The secret number was</span>
          <span className="secret-number">{gameResult.secretNumber}</span>
        </motion.div>

        {/* Scoreboard */}
        <div className="scoreboard">
          <h3 className="score-title">📊 Scoreboard</h3>
          <div className="score-rows">
            {room?.players?.map((p) => (
              <motion.div
                key={p.id}
                className={`score-row ${p.id === gameResult.winnerId ? "score-winner" : ""}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <span className="score-avatar">{p.avatar}</span>
                <span className="score-name">
                  {p.username}
                  {p.id === myPlayer?.id && " (You)"}
                </span>
                <span className="score-pts">
                  🏆 {gameResult.scores?.[p.username] || 0}
                </span>
                {p.id === gameResult.winnerId && (
                  <span className="score-crown">👑</span>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Rematch status */}
        {rematchStatus && (
          <motion.p
            className="rematch-status"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {rematchStatus}
          </motion.p>
        )}

        {/* Actions */}
        <div className="result-actions">
          <motion.button
            className="btn btn-rematch"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={onRematch}
          >
            🔄 Play Again
          </motion.button>
          <motion.button
            className="btn btn-home"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={onGoHome}
          >
            🏠 Home
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
