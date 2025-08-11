import type React from "react";
import { useGame } from "../contexts/GameContext";
import { BACKEND_URL } from "../contexts/SocketContext";

const Game: React.FC = () => {
  const { prompt, css, submitted, setCss, submitCss, timer, currentTurn } =
    useGame();

  if (!prompt) {
    return <div>Loading game...</div>;
  }

  const srcDoc = `
    <html>
      <body>${prompt.html}</body>
      <style>${css}</style>
    </html>
  `;

  const handleSubmit = () => {
    submitCss();
  };

  return (
    <div className="h-screen w-screen flex flex-col p-4 gap-4 bg-gray-100">
      <header className="flex-shrink-0 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Replicate the Target!</h1>
        <div className="text-right">
          {currentTurn && (
            <div className="text-lg font-semibold">
              Turn: {currentTurn.number} / {currentTurn.total}
            </div>
          )}
          {timer !== null && (
            <div className="text-xl font-mono bg-red-500 text-white px-3 py-1 rounded">
              Time: {timer}s
            </div>
          )}
        </div>
      </header>

      <div className="flex-grow grid grid-cols-2 grid-rows-2 gap-4">
        {/* Target Image */}
        <div className="bg-white rounded-lg shadow p-4 flex flex-col">
          <h2 className="text-lg font-semibold mb-2">Target</h2>
          <div className="flex-grow flex items-center justify-center bg-gray-200 rounded">
            <img
              src={`${BACKEND_URL}${prompt.targetImageUrl}`}
              alt="Target screenshot"
              className="max-w-full max-h-full object-contain"
            />
          </div>
        </div>

        {/* Live Preview */}
        <div className="bg-white rounded-lg shadow p-4 flex flex-col">
          <h2 className="text-lg font-semibold mb-2">Your Preview</h2>
          <div className="flex-grow bg-gray-200 rounded">
            <iframe
              srcDoc={srcDoc}
              title="Live Preview"
              sandbox="allow-scripts"
              className="w-full h-full border-0"
            />
          </div>
        </div>

        {/* HTML (Read-only) */}
        <div className="bg-white rounded-lg shadow p-4 flex flex-col">
          <h2 className="text-lg font-semibold mb-2">HTML</h2>
          <pre className="flex-grow bg-gray-800 text-white p-3 rounded-md overflow-auto text-sm">
            <code>{prompt.html}</code>
          </pre>
        </div>

        {/* CSS Editor */}
        <div className="bg-white rounded-lg shadow p-4 flex flex-col">
          <h2 className="text-lg font-semibold mb-2">Your CSS</h2>
          <textarea
            value={css}
            onChange={(e) => setCss(e.target.value)}
            className="flex-grow w-full p-2 border border-gray-300 rounded-md font-mono text-sm focus:ring-2 focus:ring-indigo-500"
            placeholder="body { background-color: #...; }"
            disabled={submitted}
          />
        </div>
      </div>

      <footer className="flex-shrink-0 text-center">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitted}
          className="w-1/2 py-3 px-6 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {submitted ? "Waiting for others..." : "Submit CSS"}
        </button>
      </footer>
    </div>
  );
};

export default Game;
