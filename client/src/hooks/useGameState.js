// src/hooks/useGameState.js
import { useState, useEffect } from 'react';
import { initGameBus, listenToSlice, getGameData } from '../state/GameBus';
import { subscribeStatus } from '../ws';

export function useGameState(channels = [], playerId = null) {
  const [wsStatus, setWsStatus] = useState('disconnected');
  const baseData = getGameData();

  const [players, setPlayers] = useState(baseData.players);
  const [gameMeta, setGameMeta] = useState(baseData.gameMeta);
  const [log, setLog] = useState(baseData.log);
  const [me, setMe] = useState(
    playerId ? baseData.playerSlices.get(playerId) : null
  );

  useEffect(() => {
    initGameBus();
    const unsubStatus = subscribeStatus(setWsStatus);
    const unsubs = [];

    if (channels.includes('PLAYERS_UPDATE'))
      unsubs.push(listenToSlice('PLAYERS_UPDATE', setPlayers));
    if (channels.includes('GAME_META_UPDATE'))
      unsubs.push(listenToSlice('GAME_META_UPDATE', setGameMeta));
    if (channels.includes('LOG_UPDATE'))
      unsubs.push(listenToSlice('LOG_UPDATE', setLog));

    if (playerId != null)
      unsubs.push(listenToSlice('PLAYER_UPDATE', setMe, playerId));

    return () => {
      unsubStatus();
      unsubs.forEach((u) => u());
    };
  }, [channels, playerId]);

  return { wsStatus, players, gameMeta, log, me, setMe };
}
