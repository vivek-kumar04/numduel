// hooks/useGame.js
// Central game state management + socket event wiring

import { useState, useEffect, useCallback, useRef } from "react";
import { useSocket } from "./useSocket";

export const SCREENS = {
  HOME: "home",
  WAITING: "waiting",
  GAME: "game",
  RESULT: "result",
};

const TURN_TIMEOUT = 30; // seconds

export function useGame() {
  const { emit, on, off, socket } = useSocket();

  // ── State ──────────────────────────────────────────────────────────────────
  const [screen, setScreen] = useState(SCREENS.HOME);
  const [username, setUsername] = useState("");
  const [room, setRoom] = useState(null);
  const [myPlayer, setMyPlayer] = useState(null);
  const [currentPlayerId, setCurrentPlayerId] = useState(null);
  const [guessHistory, setGuessHistory] = useState([]);
  const [chat, setChat] = useState([]);
  const [hint, setHint] = useState(null);
  const [gameResult, setGameResult] = useState(null); // { winner, winnerId, secretNumber, scores }
  const [error, setError] = useState(null);
  const [turnTimer, setTurnTimer] = useState(TURN_TIMEOUT);
  const [rematchStatus, setRematchStatus] = useState(null);
  const [notification, setNotification] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  const timerRef = useRef(null);

  // ── Timer Logic ────────────────────────────────────────────────────────────
  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTurnTimer(TURN_TIMEOUT);
    timerRef.current = setInterval(() => {
      setTurnTimer((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  // ── Notification helper ────────────────────────────────────────────────────
  const showNotification = useCallback((msg, type = "info") => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  }, []);

  // ── Socket Events ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!socket) return;

    const handleConnect = () => setIsConnected(true);
    const handleDisconnect = () => setIsConnected(false);

    const handleRoomCreated = ({ roomId, player, room }) => {
      setMyPlayer(player);
      setRoom(room);
      setScreen(SCREENS.WAITING);
    };

    const handlePlayerJoined = ({ player, room }) => {
      setRoom(room);
      if (socket && player.id === socket.id) {
        setMyPlayer(player);
      } else {
        showNotification(`${player.username} joined the room!`, "success");
      }
    };

    const handleGameStart = ({ room, currentPlayer, currentPlayerId }) => {
      setRoom(room);
      setCurrentPlayerId(currentPlayerId);
      if (socket) {
        const me = room.players.find((p) => p.id === socket.id);
        if (me) setMyPlayer(me);
      }
      setGuessHistory([]);
      setHint(null);
      setScreen(SCREENS.GAME);
      startTimer();
      showNotification(
        `Game started! ${currentPlayer} goes first.`,
        "success"
      );
    };

    const handleGuessResult = (entry) => {
      setGuessHistory((prev) => [entry, ...prev]);
      setHint({ hint: entry.hint, guess: entry.guess, player: entry.player });
    };

    const handleTurnChange = ({ currentPlayer, currentPlayerId }) => {
      setCurrentPlayerId(currentPlayerId);
      startTimer();
      showNotification(`${currentPlayer}'s turn!`, "info");
    };

    const handleTurnSkipped = ({ skippedPlayer }) => {
      showNotification(`${skippedPlayer}'s turn was skipped (timeout)!`, "warning");
    };

    const handleGameOver = (result) => {
      stopTimer();
      setGameResult(result);
      setGuessHistory(result.guessHistory);
      setScreen(SCREENS.RESULT);
    };

    const handleChatMessage = (entry) => {
      setChat((prev) => [...prev, entry]);
    };

    const handleRematchRequested = ({ player }) => {
      setRematchStatus(`${player} wants a rematch!`);
      showNotification(`${player} wants a rematch!`, "info");
    };

    const handleGameRestart = ({ room, currentPlayer, currentPlayerId }) => {
      setRoom(room);
      setCurrentPlayerId(currentPlayerId);
      setGuessHistory([]);
      setHint(null);
      setGameResult(null);
      setRematchStatus(null);
      setScreen(SCREENS.GAME);
      startTimer();
      showNotification("New round started!", "success");
    };

    const handlePlayerDisconnected = ({ username }) => {
      showNotification(`${username} disconnected!`, "warning");
      stopTimer();
    };

    const handleError = ({ message }) => {
      setError(message);
      setTimeout(() => setError(null), 4000);
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("room_created", handleRoomCreated);
    socket.on("player_joined", handlePlayerJoined);
    socket.on("game_start", handleGameStart);
    socket.on("guess_result", handleGuessResult);
    socket.on("turn_change", handleTurnChange);
    socket.on("turn_skipped", handleTurnSkipped);
    socket.on("game_over", handleGameOver);
    socket.on("chat_message", handleChatMessage);
    socket.on("rematch_requested", handleRematchRequested);
    socket.on("game_restart", handleGameRestart);
    socket.on("player_disconnected", handlePlayerDisconnected);
    socket.on("error", handleError);

    setIsConnected(socket.connected);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("room_created", handleRoomCreated);
      socket.off("player_joined", handlePlayerJoined);
      socket.off("game_start", handleGameStart);
      socket.off("guess_result", handleGuessResult);
      socket.off("turn_change", handleTurnChange);
      socket.off("turn_skipped", handleTurnSkipped);
      socket.off("game_over", handleGameOver);
      socket.off("chat_message", handleChatMessage);
      socket.off("rematch_requested", handleRematchRequested);
      socket.off("game_restart", handleGameRestart);
      socket.off("player_disconnected", handlePlayerDisconnected);
      socket.off("error", handleError);
    };
  }, [socket, startTimer, stopTimer, showNotification]);

  // ── Actions ────────────────────────────────────────────────────────────────
  const createRoom = useCallback(
    (name) => {
      setUsername(name);
      emit("create_room", { username: name });
    },
    [emit]
  );

  const joinRoom = useCallback(
    (name, roomId) => {
      setUsername(name);
      emit("join_room", { username: name, roomId: roomId.toUpperCase() });
    },
    [emit]
  );

  const submitGuess = useCallback(
    (guess) => {
      if (!room) return;
      emit("submit_guess", { roomId: room.id, guess });
    },
    [emit, room]
  );

  const sendChat = useCallback(
    (message) => {
      if (!room) return;
      emit("send_chat", { roomId: room.id, message });
    },
    [emit, room]
  );

  const requestRematch = useCallback(() => {
    if (!room) return;
    emit("request_rematch", { roomId: room.id });
  }, [emit, room]);

  const goHome = useCallback(() => {
    setScreen(SCREENS.HOME);
    setRoom(null);
    setMyPlayer(null);
    setGuessHistory([]);
    setChat([]);
    setHint(null);
    setGameResult(null);
    setRematchStatus(null);
    stopTimer();
  }, [stopTimer]);

  const isMyTurn = myPlayer && currentPlayerId === myPlayer.id;

  return {
    screen,
    username,
    room,
    myPlayer,
    currentPlayerId,
    isMyTurn,
    guessHistory,
    chat,
    hint,
    gameResult,
    error,
    turnTimer,
    rematchStatus,
    notification,
    isConnected,
    // actions
    createRoom,
    joinRoom,
    submitGuess,
    sendChat,
    requestRematch,
    goHome,
  };
}
