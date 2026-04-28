// components/Notification.jsx
import { AnimatePresence, motion } from "framer-motion";

const typeStyles = {
  info: { bg: "#6366f1", icon: "ℹ️" },
  success: { bg: "#22c55e", icon: "✅" },
  warning: { bg: "#f59e0b", icon: "⚡" },
  error: { bg: "#ef4444", icon: "❌" },
};

export default function Notification({ notification }) {
  const style = typeStyles[notification?.type] || typeStyles.info;

  return (
    <AnimatePresence>
      {notification && (
        <motion.div
          className="notification-toast"
          style={{ background: style.bg }}
          initial={{ opacity: 0, y: -40, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -40, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          <span>{style.icon}</span>
          <span>{notification.msg}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
