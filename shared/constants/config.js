// /shared/constants/config.js
export const MAX_PLAYERS = 9;
export const SIMULTANEOUS_PHASE_ACTIONS = true;
export const DIAL = 'dial';
export const CONFIRM = 'confirm';
export const ACTION_KEYS = ['key_a', 'key_b', 'key_c'];
export const DEFAULT_ROLE = 'villager';
export const MINIMUM_ROLES = {
  4: { murderer: 1, detective: 1 },
  5: { murderer: 1, detective: 1 },
  6: { murderer: 1, detective: 1 },
  7: { murderer: 1, detective: 1 },
  8: { murderer: 2, detective: 1 },
  9: { murderer: 2, detective: 1, doctor: 1 },
};
// Shared server/client channels
export const CHANNELS = {
  playerUpdate: (playerId) => `PLAYER_UPDATE:${playerId}`,
  LOG_UPDATE: 'LOG_UPDATE',
  GAME_UPDATE: 'GAME_UPDATE',
  SLIDES_UPDATE: 'SLIDES_UPDATE',
};

export const DEBUG = {
  showSystemLogs: false,
};
