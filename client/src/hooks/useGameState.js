// src/hooks/useGameState.js
import { useState, useEffect } from 'react';
import { initGameBus, listenToSlice, getGameData } from '../state/GameBus';
import { subscribeStatus } from '../ws';

/**
 * Simplified game state hook
 * Slices: game (players + phase + activeEvents), log, slides, me
 */
export function useGameState({ playerId = null } = {}) {
  const baseData = getGameData();

  // -----------------------------
  // State slices
  // -----------------------------
  const [wsStatus, setWsStatus] = useState('disconnected');
  const [game, setGame] = useState({
    phase: baseData.phase,
    phaseIndex: baseData.phaseIndex,
    dayCount: baseData.dayCount,
    gameStarted: baseData.gameStarted,
    players: baseData.players,
    activeEvents: baseData.activeEvents,
    availableEvents: baseData.availableEvents,
  });
  const [log, setLog] = useState(baseData.log);
  const [slides, setSlides] = useState(baseData.slides);
  const [me, setMe] = useState(
    playerId != null ? baseData.playerSlices.get(playerId) ?? null : null
  );

  // -----------------------------
  // Effect: initialize bus & subscriptions
  // -----------------------------
  useEffect(() => {
    initGameBus();

    const unsubs = [];
    const unsubStatus = subscribeStatus((status) => {
      setWsStatus(status);
    });

    // -----------------------------
    // GAME_UPDATE: players + phase + activeEvents
    // -----------------------------
    unsubs.push(
      listenToSlice('GAME_UPDATE', (data) => {
        setGame({
          phase: data.phase,
          phaseIndex: data.phaseIndex,
          dayCount: data.dayCount,
          gameStarted: data.gameStarted,
          players: data.players ?? [],
          activeEvents: data.activeEvents ?? [],
          availableEvents: data.availableEvents ?? [],
        });

        if (playerId != null) {
          const player = data.players?.find((p) => p.id === playerId);
          if (player) setMe(player);
        }
      })
    );

    // -----------------------------
    // LOG_UPDATE
    // -----------------------------
    unsubs.push(
      listenToSlice('LOG_UPDATE', (data) => {
        setLog(data);
      })
    );

    // -----------------------------
    // SLIDES_UPDATE
    // -----------------------------
    unsubs.push(
      listenToSlice('SLIDES_UPDATE', (data) => {
        setSlides(data);
      })
    );

    // -----------------------------
    // PLAYER_UPDATE for current player
    // -----------------------------
    if (playerId != null) {
      unsubs.push(
        listenToSlice(
          'PLAYER_UPDATE',
          (playerData) => {
            setMe(playerData);
          },
          playerId
        )
      );
    }

    return () => {
      unsubStatus();
      unsubs.forEach((u) => u());
    };
  }, [playerId]);

  return {
    wsStatus,
    game,
    log,
    slides,
    me,
  };
}
