import type React from "react";
import { useGame } from "../contexts/GameContext";
import { BACKEND_URL, useSocket } from "../contexts/SocketContext";

const Results: React.FC = () => {
  const { results, shownResultStep, nextResultStep, returnToLobby, roomState } =
    useGame();
  const socket = useSocket();

  if (!results || !shownResultStep) {
    return <div>Loading results...</div>;
  }

  const isHost = socket.id === roomState?.hostId;
  const allStepsShown =
    shownResultStep.chainIndex >= results.chains.length - 1 &&
    shownResultStep.stepIndex >=
      results.chains[results.chains.length - 1].steps.length - 1;

  return (
    <div className="max-w-6xl mx-auto mt-10 p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Game Results</h1>
        {isHost && (
          <div className="flex gap-4">
            <button
              type="button"
              onClick={nextResultStep}
              disabled={allStepsShown}
              className="py-2 px-5 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
            >
              Next Step
            </button>
            <button
              type="button"
              onClick={returnToLobby}
              className="py-2 px-5 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Return to Lobby
            </button>
          </div>
        )}
      </div>

      <div className="space-y-12">
        {results.chains.map((chain, chainIndex) => (
          <div
            // biome-ignore lint: 入れ替え発生しない
            key={chainIndex}
            className="p-6 border rounded-lg shadow-md bg-white"
          >
            <h2 className="text-2xl font-bold mb-4">Chain {chainIndex + 1}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Initial Prompt */}
              <div className="border-2 border-dashed border-gray-400 p-4 rounded-lg">
                <h3 className="text-xl font-semibold mb-2 text-center">
                  Initial Prompt
                </h3>
                <div className="flex items-center justify-center bg-gray-200 rounded p-2">
                  <img
                    src={`${BACKEND_URL}${chain.initialPrompt.targetImageUrl}`}
                    alt="Initial prompt"
                    className="max-w-full max-h-64 object-contain"
                  />
                </div>
              </div>

              {/* Steps */}
              {chain.steps.map((step, stepIndex) => {
                const isVisible =
                  chainIndex < shownResultStep.chainIndex ||
                  (chainIndex === shownResultStep.chainIndex &&
                    stepIndex <= shownResultStep.stepIndex);
                if (!isVisible) return null;

                return (
                  <div
                    // biome-ignore lint: 入れ替え発生しない
                    key={stepIndex}
                    className="p-4 rounded-lg bg-gray-50 shadow-inner"
                  >
                    <h4 className="text-lg font-semibold mb-2">
                      Turn {stepIndex + 1} by{" "}
                      <span className="text-indigo-600">
                        {step.author.name}
                      </span>
                    </h4>
                    <div className="flex items-center justify-center bg-gray-200 rounded p-2">
                      <img
                        src={`${BACKEND_URL}${step.resultImageUrl}`}
                        alt={`Result from ${step.author.name}`}
                        className="max-w-full max-h-64 object-contain"
                      />
                    </div>
                    <details className="mt-2">
                      <summary className="cursor-pointer text-sm font-medium text-gray-600">
                        Show Submitted CSS
                      </summary>
                      <pre className="mt-1 bg-gray-800 text-white p-2 rounded-md overflow-auto text-xs">
                        <code>{step.submittedCss}</code>
                      </pre>
                    </details>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Results;
