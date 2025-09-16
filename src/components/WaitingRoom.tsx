import type React from "react";
import { useState } from "react";
import { useGame } from "../contexts/GameContext";
import { useSocket } from "../contexts/SocketContext";
import { TipRotator } from "./LoadingScreen";

const WaitingRoom: React.FC = () => {
  const { roomState, startGame, timerSettings, updateTimerSettings } =
    useGame();
  const socket = useSocket();
  const [showTimerSettings, setShowTimerSettings] = useState(false);
  const [timerDuration, setTimerDuration] = useState(300);

  if (!roomState) {
    return <div>Loading...</div>;
  }

  const isHost = socket.id === roomState.hostId;
  const canStartGame = roomState.users.length >= 2;

  const handleTimerSettingsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateTimerSettings(timerDuration);
    setShowTimerSettings(false);
  };

  return (
    <div className="w-[95%] mx-auto mt-10 p-8 border rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold text-center mb-4">Waiting Room</h1>
      <div className="text-center mb-6">
        <p className="text-lg">
          Room Code:{" "}
          <span className="font-mono bg-gray-200 px-2 py-1 rounded">
            {roomState.roomCode}
          </span>
        </p>
        {timerSettings && (
          <p className="text-sm text-gray-600 mt-2">
            タイマー設定: {timerSettings.durationSeconds}秒
          </p>
        )}
      </div>
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

      {isHost && (
        <div className="mt-8">
          <div className="mb-4 text-center">
            <button
              type="button"
              onClick={() => setShowTimerSettings(!showTimerSettings)}
              className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {showTimerSettings ? "タイマー設定を閉じる" : "タイマー設定"}
            </button>
          </div>

          {showTimerSettings && (
            <div className="mb-6 p-4 border border-gray-200 rounded-md bg-gray-50">
              <h3 className="text-lg font-medium mb-3">タイマー設定</h3>
              <form onSubmit={handleTimerSettingsSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="timerDuration"
                    className="block text-sm font-medium text-gray-700"
                  >
                    制限時間（秒）
                  </label>
                  <input
                    type="number"
                    id="timerDuration"
                    min="20"
                    max="1200"
                    value={timerDuration}
                    onChange={(e) => setTimerDuration(Number(e.target.value))}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    20秒〜1200秒の範囲で設定してください
                  </p>
                </div>
                <button
                  type="submit"
                  className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  設定を更新
                </button>
              </form>
            </div>
          )}

          <div className="text-center">
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
        </div>
      )}

      {!isHost && (
        <p className="mt-8 text-center text-lg text-gray-600">
          Waiting for the host to start the game...
        </p>
      )}

      <div className="mt-10">
        <TipRotator title="CSS TIPS (15秒ごとに更新)" wide />
      </div>
    </div>
  );
};

export default WaitingRoom;
