import type React from "react";
import { useState } from "react";
import { useGame } from "../contexts/GameContext";
import { BACKEND_URL, useSocket } from "../contexts/SocketContext";
import { LoadingGate } from "./LoadingScreen";

const Results: React.FC = () => {
  const { results, shownResultStep, nextResultStep, returnToLobby, roomState } =
    useGame();
  const socket = useSocket();

  const [showAll, setShowAll] = useState(false);

  return (
    <LoadingGate
      ready={Boolean(results && shownResultStep)}
      title="Loading results..."
    >
      {/* Guard: Only rendered when ready, but keep runtime check */}
      {!results || !shownResultStep ? null : (
        <div className="max-w-6xl mx-auto mt-10 p-8">
          {(() => {
            const isHost = socket.id === roomState?.hostId;
            const allStepsShown =
              shownResultStep.chainIndex >= results.chains.length - 1 &&
              shownResultStep.stepIndex >=
                results.chains[results.chains.length - 1].steps.length - 1;
            return (
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
                <h1 className="text-4xl font-bold">Game Results</h1>
                <div className="flex gap-3 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setShowAll((v) => !v)}
                    className={`py-2 px-5 border border-transparent rounded-md shadow-sm text-lg font-medium text-white ${showAll ? "bg-gray-600 hover:bg-gray-700" : "bg-green-600 hover:bg-green-700"}`}
                  >
                    {showAll ? "Hide Unshown" : "Show All"}
                  </button>
                  {isHost && (
                    <>
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
                    </>
                  )}
                </div>
              </div>
            );
          })()}

          <div className="space-y-12">
            {results.chains.map((chain, chainIndex) => (
              <div
                // biome-ignore lint: 入れ替え発生しない
                key={chainIndex}
                className="p-6 border rounded-lg shadow-md bg-white"
              >
                <h2 className="text-2xl font-bold mb-4">
                  Chain {chainIndex + 1}
                </h2>
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
                    <details className="mt-3">
                      <summary className="cursor-pointer text-sm font-medium text-gray-600">
                        Show Initial HTML
                      </summary>
                      <pre className="mt-1 bg-gray-800 text-white p-2 rounded-md overflow-auto text-xs">
                        <code>{chain.initialPrompt.html}</code>
                      </pre>
                    </details>
                  </div>
                  {chain.initialPrompt.css && (
                    <details className="mt-3">
                      <summary className="cursor-pointer text-sm font-medium text-gray-600">
                        Show Initial CSS
                      </summary>
                      <pre className="mt-1 bg-gray-800 text-white p-2 rounded-md overflow-auto text-xs">
                        <code>{chain.initialPrompt.css}</code>
                      </pre>
                    </details>
                  )}

                  {/* Steps */}
                  {chain.steps.map((step, stepIndex) => {
                    const isVisible = showAll
                      ? true
                      : chainIndex < shownResultStep.chainIndex ||
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
      )}
    </LoadingGate>
  );
};

export default Results;
