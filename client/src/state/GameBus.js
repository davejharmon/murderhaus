// src/state/GameBus.js
import { subscribe } from '../ws';

// Keep global data and listener registry
const gameData = {
  players: [],
  gameMeta: { phase: null, gameStarted: false, dayCount: 0 },
  log: [],
  playerSlices: new Map(), // playerId -> data
};

const updateFns = {
  PLAYERS_UPDATE: new Set(),
  GAME_META_UPDATE: new Set(),
  LOG_UPDATE: new Set(),
  PLAYER_UPDATE: new Map(), // playerId -> Set()
};

let initialized = false;

export function initGameBus() {
  if (initialized) return;
  initialized = true;

  // Global subscriptions — each fan out to registered listeners
  subscribe('PLAYERS_UPDATE', (payload) => {
    gameData.players = payload;
    updateFns.PLAYERS_UPDATE.forEach((fn) => fn(payload));
  });
  subscribe('GAME_META_UPDATE', (payload) => {
    gameData.gameMeta = payload;
    updateFns.GAME_META_UPDATE.forEach((fn) => fn(payload));
  });
  subscribe('LOG_UPDATE', (payload) => {
    gameData.log = payload;
    updateFns.LOG_UPDATE.forEach((fn) => fn(payload));
  });
}

// Register a slice listener
export function listenToSlice(type, fn, playerId = null) {
  if (type === 'PLAYER_UPDATE') {
    if (!updateFns.PLAYER_UPDATE.has(playerId))
      updateFns.PLAYER_UPDATE.set(playerId, new Set());
    updateFns.PLAYER_UPDATE.get(playerId).add(fn);
    return () => updateFns.PLAYER_UPDATE.get(playerId)?.delete(fn);
  } else {
    updateFns[type].add(fn);
    return () => updateFns[type].delete(fn);
  }
}

export function getGameData() {
  return gameData;
}
