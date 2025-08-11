import Game from "./components/Game";
import Lobby from "./components/Lobby";
import Results from "./components/Results";
import WaitingRoom from "./components/WaitingRoom";
import { GameProvider, useGame } from "./contexts/GameContext";
import { SocketProvider } from "./contexts/SocketContext";

const AppContent = () => {
  const { roomState } = useGame();

  return (
    <main className="container mx-auto p-4">
      {!roomState ? (
        <Lobby />
      ) : roomState.gameState === "LOBBY" ? (
        <WaitingRoom />
      ) : roomState.gameState === "IN_GAME" ? (
        <Game />
      ) : roomState.gameState === "RESULTS" ? (
        <Results />
      ) : (
        <Lobby /> // Fallback to Lobby
      )}
    </main>
  );
};

function App() {
  return (
    <SocketProvider>
      <GameProvider>
        <AppContent />
      </GameProvider>
    </SocketProvider>
  );
}

export default App;
