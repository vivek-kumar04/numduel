// hooks/useSocket.js
// Manages the Socket.IO connection lifecycle

import { useEffect, useRef, useCallback } from "react";
import { io } from "socket.io-client";

const SERVER_URL =
  process.env.REACT_APP_SERVER_URL || "http://localhost:3001";

let socketInstance = null;

export function useSocket() {
  const socketRef = useRef(null);

  useEffect(() => {
    // Reuse existing connection or create new one
    if (!socketInstance || !socketInstance.connected) {
      socketInstance = io(SERVER_URL, {
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });
    }
    socketRef.current = socketInstance;

    return () => {
      // Don't disconnect on unmount - keep connection alive across pages
    };
  }, []);

  const emit = useCallback((event, data) => {
    if (socketRef.current) {
      socketRef.current.emit(event, data);
    }
  }, []);

  const on = useCallback((event, handler) => {
    if (socketRef.current) {
      socketRef.current.on(event, handler);
    }
    return () => {
      if (socketRef.current) {
        socketRef.current.off(event, handler);
      }
    };
  }, []);

  const off = useCallback((event, handler) => {
    if (socketRef.current) {
      socketRef.current.off(event, handler);
    }
  }, []);

  return { socket: socketRef.current, emit, on, off };
}
