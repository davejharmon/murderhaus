// src/hooks/useGameState.js
import { useEffect, useState, useCallback } from 'react';
import { subscribe, subscribeStatus } from '../ws';

/**
 * Hook to manage global game state and per-player state slices
 * @param {string[]} channels - optional list of slices to subscribe to
 * @param {number|null} playerId - optional player ID for personal slice
 */
export function useGameState(channels = [], playerId = null) {
  const [wsStatus, setWsStatus] = useState('disconnected');
  const [players, setPlayers] = useState([]);
  const [gameMeta, setGameMeta] = useState({
    phase: null,
    gameStarted: false,
    dayCount: 0,
  });
  const [log, setLog] = useState([]);
  const [me, setMe] = useState(null); // per-player slice

  // Generic handler for messages
  const handleMessage = useCallback(
    (type, payload) => {
      switch (type) {
        case 'PLAYERS_UPDATE':
          setPlayers(payload);
          break;

        case 'GAME_META_UPDATE':
          setGameMeta(payload);
          break;

        case 'LOG_UPDATE':
          setLog(payload);
          break;

        default:
          if (type.startsWith('PLAYER_UPDATE:')) {
            const id = Number(type.split(':')[1]);
            if (playerId === id) setMe(payload);
            setPlayers((prev) => prev.map((p) => (p.id === id ? payload : p)));
          }
          break;
      }
    },
    [playerId]
  );

  useEffect(() => {
    // Subscribe to WebSocket status
    const unsubStatus = subscribeStatus(setWsStatus);

    const unsubs = [];

    if (channels.includes('PLAYERS_UPDATE')) {
      unsubs.push(
        subscribe('PLAYERS_UPDATE', (payload) =>
          handleMessage('PLAYERS_UPDATE', payload)
        )
      );
    }

    if (channels.includes('GAME_META_UPDATE')) {
      unsubs.push(
        subscribe('GAME_META_UPDATE', (payload) =>
          handleMessage('GAME_META_UPDATE', payload)
        )
      );
    }

    if (channels.includes('LOG_UPDATE')) {
      unsubs.push(
        subscribe('LOG_UPDATE', (payload) =>
          handleMessage('LOG_UPDATE', payload)
        )
      );
    }

    if (playerId != null) {
      unsubs.push(
        subscribe(`PLAYER_UPDATE:${playerId}`, (payload) =>
          handleMessage(`PLAYER_UPDATE:${playerId}`, payload)
        )
      );
    }

    return () => {
      unsubStatus();
      unsubs.forEach((unsub) => unsub());
    };
  }, [channels, playerId, handleMessage]);

  return { wsStatus, players, gameMeta, log, me, setMe };
}
