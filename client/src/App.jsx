// App.jsx
// Root component: wires screens together via useGame hook

import { useGame, SCREENS } from "./hooks/useGame";
import HomePage from "./components/HomePage";
import WaitingRoom from "./components/WaitingRoom";
import GameScreen from "./components/GameScreen";
import ResultScreen from "./components/ResultScreen";
import Notification from "./components/Notification";
import { AnimatePresence, motion } from "framer-motion";

function App() {
  const game = useGame();

  return (
    <div className="app">
      {/* Global notification */}
      <Notification notification={game.notification} />

      {/* Connection indicator */}
      <div className={`conn-dot ${game.isConnected ? "conn-online" : "conn-offline"}`}
        title={game.isConnected ? "Connected" : "Disconnected"}
      />

      <AnimatePresence mode="wait">
        {game.screen === SCREENS.HOME && (
          <motion.div key="home" className="screen-wrap"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <HomePage
              onCreateRoom={game.createRoom}
              onJoinRoom={game.joinRoom}
              error={game.error}
            />
          </motion.div>
        )}

        {game.screen === SCREENS.WAITING && (
          <motion.div key="waiting" className="screen-wrap"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <WaitingRoom
              room={game.room}
              myPlayer={game.myPlayer}
              onGoHome={game.goHome}
            />
          </motion.div>
        )}

        {game.screen === SCREENS.GAME && (
          <motion.div key="game" className="screen-wrap"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <GameScreen
              room={game.room}
              myPlayer={game.myPlayer}
              currentPlayerId={game.currentPlayerId}
              isMyTurn={game.isMyTurn}
              guessHistory={game.guessHistory}
              chat={game.chat}
              hint={game.hint}
              turnTimer={game.turnTimer}
              onSubmitGuess={game.submitGuess}
              onSendChat={game.sendChat}
              error={game.error}
            />
          </motion.div>
        )}

        {game.screen === SCREENS.RESULT && (
          <motion.div key="result" className="screen-wrap"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <ResultScreen
              gameResult={game.gameResult}
              myPlayer={game.myPlayer}
              room={game.room}
              rematchStatus={game.rematchStatus}
              onRematch={game.requestRematch}
              onGoHome={game.goHome}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
