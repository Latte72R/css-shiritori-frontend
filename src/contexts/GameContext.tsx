import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useSocket } from './SocketContext';
import type { RoomState, Prompt, GameResults, ShowResultStepPayload } from '../common/events';

interface GameContextType {
  roomState: RoomState | null;
  prompt: Prompt | null;
  results: GameResults | null;
  currentTurn: { number: number; total: number } | null;
  timer: number | null;
  lastError: string | null;
  shownResultStep: ShowResultStepPayload | null;
  joinRoom: (roomCode: string, name: string) => void;
  startGame: () => void;
  submitCss: (css: string) => void;
  nextResultStep: () => void;
  returnToLobby: () => void;
}

const GameContext = createContext<GameContextType | null>(null);

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const socket = useSocket();
  const [roomState, setRoomState] = useState<RoomState | null>(null);
  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [results, setResults] = useState<GameResults | null>(null);
  const [currentTurn, setCurrentTurn] = useState<{ number: number; total: number } | null>(null);
  const [timer, setTimer] = useState<number | null>(null);
  const [lastError, setLastError] = useState<string | null>(null);
  const [shownResultStep, setShownResultStep] = useState<ShowResultStepPayload | null>(null);

  useEffect(() => {
    // Listen for server events
    socket.on('updateRoomState', setRoomState);
    socket.on('gameStart', (initialPrompt) => {
      setPrompt(initialPrompt);
      setResults(null);
      setCurrentTurn({ number: 1, total: roomState?.users.length ?? 1 });
    });
    socket.on('newTurn', (newPrompt, turnNumber, totalTurns) => {
      setPrompt(newPrompt);
      setCurrentTurn({ number: turnNumber, total: totalTurns });
    });
    socket.on('timerUpdate', setTimer);
    socket.on('gameFinished', (results) => {
      setResults(results);
      setShownResultStep({ chainIndex: 0, stepIndex: -1 }); // Initialize for viewing
    });
    socket.on('showNextResult', setShownResultStep);
    socket.on('lobbyReset', () => {
      setPrompt(null);
      setResults(null);
      setCurrentTurn(null);
      setTimer(null);
    });
    socket.on('error', ({ message }) => setLastError(message));

    return () => {
      // Clean up listeners
      socket.off('updateRoomState');
      socket.off('gameStart');
      socket.off('newTurn');
      socket.off('timerUpdate');
      socket.off('gameFinished');
      socket.off('lobbyReset');
      socket.off('error');
    };
  }, [socket, roomState?.users.length]);

  const joinRoom = useCallback((roomCode: string, name: string) => {
    if (socket.disconnected) {
      socket.connect();
    }
    socket.emit('joinRoom', { roomCode, name }, (response) => {
      if (response.success) {
        setRoomState(response.roomState);
      } else {
        setLastError(response.message);
      }
    });
  }, [socket]);

  const startGame = useCallback(() => {
    socket.emit('startGame', (response) => {
      if (!response.success) {
        setLastError('Failed to start game.');
      }
    });
  }, [socket]);

  const submitCss = useCallback((css: string) => {
    socket.emit('submitCss', { css }, (response) => {
      if (!response.success) {
        setLastError(response.message);
      }
    });
  }, [socket]);

  const nextResultStep = useCallback(() => {
    socket.emit('nextResultStep');
  }, [socket]);

  const returnToLobby = useCallback(() => {
    socket.emit('returnToLobby');
  }, [socket]);

  const value = {
    roomState,
    prompt,
    results,
    currentTurn,
    timer,
    lastError,
    shownResultStep,
    joinRoom,
    startGame,
    submitCss,
    nextResultStep,
    returnToLobby,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};
