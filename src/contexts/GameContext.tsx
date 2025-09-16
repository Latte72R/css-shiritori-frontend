import type React from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type {
  GameResults,
  Prompt,
  RoomState,
  ShowResultStepPayload,
  UpdateTimerSettingsPayload,
} from "../common/events";
import { useSocket } from "./SocketContext";

interface GameContextType {
  roomState: RoomState | null;
  prompt: Prompt | null;
  results: GameResults | null;
  currentTurn: { number: number; total: number } | null;
  timer: number | null;
  lastError: string | null;
  shownResultStep: ShowResultStepPayload | null;
  css: string;
  submitted: boolean;
  timerSettings: UpdateTimerSettingsPayload | null;
  setCss: React.Dispatch<React.SetStateAction<string>>;
  joinRoom: (roomCode: string, name: string) => void;
  startGame: () => void;
  submitCss: () => void;
  cancelSubmit: () => void;
  nextResultStep: () => void;
  returnToLobby: () => void;
  updateTimerSettings: (durationSeconds: number) => void;
}

const GameContext = createContext<GameContextType | null>(null);

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
};

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const socket = useSocket();
  const [roomState, setRoomState] = useState<RoomState | null>(null);
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [results, setResults] = useState<GameResults | null>(null);
  const [currentTurn, setCurrentTurn] = useState<{
    number: number;
    total: number;
  } | null>(null);
  const [timer, setTimer] = useState<number | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);
  const [shownResultStep, setShownResultStep] =
    useState<ShowResultStepPayload | null>(null);

  const [css, setCss] = useState<string>("");
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [timerSettings, setTimerSettings] =
    useState<UpdateTimerSettingsPayload | null>(null);

  const submitCss = useCallback(() => {
    setSubmitted(true); // 送信成功時に状態を更新
    socket.emit("submitCss", { css }, (response) => {
      if (!response.success) {
        setLastError(response.message);
        setSubmitted(false); // 送信失敗時は再送可能にする
      }
    });
  }, [socket, css]);

  const handleTimerUpdate = useCallback(
    (newTimer: number) => {
      if (newTimer < 2) {
        submitCss();
      }
      setTimer(newTimer - 2);
    },
    [submitCss],
  );

  useEffect(() => {
    // Listen for server events
    socket.on("updateRoomState", setRoomState);
    socket.on("gameStart", (initialPrompt) => {
      setPrompt(initialPrompt);
      setResults(null);
      setCurrentTurn({ number: 1, total: roomState?.users.length ?? 1 });

      setCss("");
      setSubmitted(false);
    });
    socket.on("newTurn", (newPrompt, turnNumber, totalTurns) => {
      setPrompt(newPrompt);
      setCurrentTurn({ number: turnNumber, total: totalTurns });
      setCss("");
      setSubmitted(false);
    });
    socket.on("timerUpdate", handleTimerUpdate);
    socket.on("gameFinished", (results) => {
      setResults(results);
      setShownResultStep({ chainIndex: 0, stepIndex: -1 }); // Initialize for viewing
    });
    socket.on("showNextResult", setShownResultStep);
    socket.on("lobbyReset", () => {
      setPrompt(null);
      setResults(null);
      setCurrentTurn(null);
      setTimer(null);
      setCss("");
      setSubmitted(false);
    });
    socket.on("timerSettingsUpdated", (payload) => {
      setTimerSettings(payload);
    });
    socket.on("error", ({ message }) => setLastError(message));

    return () => {
      // Clean up listeners
      socket.off("updateRoomState");
      socket.off("gameStart");
      socket.off("newTurn");
      socket.off("timerUpdate");
      socket.off("gameFinished");
      socket.off("lobbyReset");
      socket.off("timerSettingsUpdated");
      socket.off("error");
    };
  }, [socket, roomState?.users.length, handleTimerUpdate]);

  const joinRoom = useCallback(
    (roomCode: string, name: string) => {
      if (socket.disconnected) {
        socket.connect();
      }
      socket.emit("joinRoom", { roomCode, name }, (response) => {
        if (response.success) {
          setRoomState(response.roomState);
        } else {
          setLastError(response.message);
        }
      });
    },
    [socket],
  );

  const startGame = useCallback(() => {
    socket.emit("startGame", (response) => {
      if (!response.success) {
        setLastError("Failed to start game.");
      }
    });
  }, [socket]);

  const cancelSubmit = useCallback(() => {
    setSubmitted(false);
    socket.emit("cancelSubmit");
  }, [socket]);

  const nextResultStep = useCallback(() => {
    socket.emit("nextResultStep");
  }, [socket]);

  const returnToLobby = useCallback(() => {
    socket.emit("returnToLobby");
  }, [socket]);

  const updateTimerSettings = useCallback(
    (durationSeconds: number) => {
      socket.emit("updateTimerSettings", { durationSeconds }, (response) => {
        if (!response.success) {
          setLastError(response.message || "Failed to update timer settings.");
        }
      });
    },
    [socket],
  );

  const value = {
    roomState,
    prompt,
    results,
    currentTurn,
    timer,
    lastError,
    shownResultStep,
    css,
    submitted,
    timerSettings,
    setCss,
    joinRoom,
    startGame,
    submitCss,
    cancelSubmit,
    nextResultStep,
    returnToLobby,
    updateTimerSettings,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};
