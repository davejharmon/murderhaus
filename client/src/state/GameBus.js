// src/state/GameBus.js
import { subscribe, subscribeServerChannel } from '../ws';

// Global data and listener registry
const gameData = {
  gameMeta: {
    phase: undefined,
    metaphase: 'PREGAME',
    phaseIndex: undefined,
    dayCount: undefined,
    gameStarted: false,
    gameOver: false,
    players: [], // only public player state
    activeEvents: [],
    availableEvents: [],
  },
  log: [], // only sent to clients that need it
  slides: {
    // only sent to clients that need it
    buffer: [],
    active: null,
  },
  playerSlices: new Map(), // playerId -> personal data
};

// Update registries
const updateFns = {
  GAME_UPDATE: new Set(), // everyone gets minimal game
  LOG_UPDATE: new Set(), // only interested clients
  PLAYER_UPDATE: new Map(), // per-player
  SLIDES_UPDATE: new Set(), // only host/observer
};

let initialized = false;

// init subscriptions
export function initGameBus() {
  if (initialized) return;
  initialized = true;

  subscribeServerChannel('SLIDES_UPDATE');

  subscribe('GAME_UPDATE', (payload) => {
    gameData.gameMeta = payload; // core game only
    updateFns.GAME_UPDATE.forEach((fn) => fn(payload));
  });

  subscribe('LOG_UPDATE', (payload) => {
    gameData.log = payload;
    updateFns.LOG_UPDATE.forEach((fn) => fn(payload));
  });

  subscribe('SLIDES_UPDATE', (slice) => {
    gameData.slides = slice;
    updateFns.SLIDES_UPDATE.forEach((fn) => fn(slice));
  });
}
/**
 * Register listener for slice
 */
export function listenToSlice(type, fn, playerId = null) {
  if (type === 'PLAYER_UPDATE') {
    if (!updateFns.PLAYER_UPDATE.has(playerId)) {
      updateFns.PLAYER_UPDATE.set(playerId, new Set());
    }
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
