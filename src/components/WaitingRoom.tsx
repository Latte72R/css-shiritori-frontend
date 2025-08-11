import type React from "react";
import { useGame } from "../contexts/GameContext";
import { useSocket } from "../contexts/SocketContext";
import { TipRotator } from "./LoadingScreen";

const WaitingRoom: React.FC = () => {
  const { roomState, startGame } = useGame();
  const socket = useSocket();

  if (!roomState) {
    return <div>Loading...</div>;
  }

  const isHost = socket.id === roomState.hostId;
  const canStartGame = roomState.users.length >= 2;

  return (
    <div className="max-w-3xl mx-auto mt-10 p-8 border rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold text-center mb-4">Waiting Room</h1>
      <div className="text-center mb-6">
        <p className="text-lg">
          Room Code:{" "}
          <span className="font-mono bg-gray-200 px-2 py-1 rounded">
            {roomState.roomCode}
          </span>
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        <div>
          <h2 className="text-xl font-semibold mb-3">
            Players ({roomState.users.length})
          </h2>
          <ul className="space-y-2 list-disc list-inside bg-gray-50 p-4 rounded-md">
            {roomState.users.map((user) => (
              <li key={user.id} className="text-gray-800">
                {user.name}
                {user.id === roomState.hostId && (
                  <span className="ml-2 text-sm font-bold text-indigo-600">
                    (Host)
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <TipRotator title="CSS TIPS (10秒ごとに更新)" />
        </div>
      </div>

      {isHost && (
        <div className="mt-8 text-center">
          <button
            type="button"
            onClick={startGame}
            disabled={!canStartGame}
            className="w-full py-3 px-6 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Start Game
          </button>
          {!canStartGame && (
            <p className="mt-2 text-sm text-gray-500">
              Need at least 2 players to start.
            </p>
          )}
        </div>
      )}

      {!isHost && (
        <p className="mt-8 text-center text-lg text-gray-600">
          Waiting for the host to start the game...
        </p>
      )}
    </div>
  );
};

export default WaitingRoom;
