import { useEffect, useRef, useCallback } from "react";
import { io } from "socket.io-client";

const SERVER_URL =
  process.env.REACT_APP_SERVER_URL || "http://localhost:3001";

export function useSocket() {
  const socketRef = useRef(null);

  useEffect(() => {
    const socket = io(SERVER_URL, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      forceNew: true,   // ← THIS is the fix
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
  }, []);

  const emit = useCallback((event, data) => {
    if (socketRef.current) socketRef.current.emit(event, data);
  }, []);

  const on = useCallback((event, handler) => {
    if (socketRef.current) socketRef.current.on(event, handler);
    return () => {
      if (socketRef.current) socketRef.current.off(event, handler);
    };
  }, []);

  const off = useCallback((event, handler) => {
    if (socketRef.current) socketRef.current.off(event, handler);
  }, []);

  return { socket: socketRef.current, emit, on, off };
}