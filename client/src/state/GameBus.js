// src/state/GameBus.js
import { subscribe, subscribeServerChannel } from '../ws';

// Keep global data and listener registry
const gameData = {
  players: [],
  gameMeta: { phase: null, gameStarted: false, dayCount: 0 },
  log: [],
  playerSlices: new Map(), // playerId -> data

  slides: {
    buffer: [], // array of slide objects
    active: null, // optional convenience pointer
  },
};

const updateFns = {
  PLAYERS_UPDATE: new Set(),
  GAME_META_UPDATE: new Set(),
  LOG_UPDATE: new Set(),
  PLAYER_UPDATE: new Map(), // playerId -> Set()
  SLIDES_UPDATE: new Set(),
};

let initialized = false;

export function initGameBus() {
  if (initialized) return;
  initialized = true;

  subscribeServerChannel('SLIDES_UPDATE');

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
  // -------------------------------
  // NEW: slide lifecycle handling
  // -------------------------------

  // front-end GameBus
  subscribe('SLIDES_UPDATE', (slice) => {
    gameData.slides = slice;
    emitSlides();
  });
}

function emitSlides() {
  updateFns.SLIDES_UPDATE.forEach((fn) => fn(gameData.slides));
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

export function listenToSlides(fn) {
  updateFns.SLIDES_UPDATE.add(fn);
  return () => updateFns.SLIDES_UPDATE.delete(fn);
}

export function getGameData() {
  return gameData;
}
