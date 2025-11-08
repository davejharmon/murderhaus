// shared/constants.js

/** -------------------
 * Game Settings
 * ------------------- */
export const MAX_PLAYERS = 9;

/** -------------------
 * Teams
 * ------------------- */
export const TEAMS = {
  CIRCLE: { name: 'CIRCLE', color: '#1976d2' },
  MURDERERS: { name: 'MURDERERS', color: '#d32f2f' },
};

/** -------------------
 * Actions
 * ------------------- */
export const ACTIONS = {
  vote: {
    name: 'vote',
    label: 'Vote',
    // default quantity: infinite (permanent action)
    defaultQuantity: Infinity,
    // default targeting rule
    getValidTargets: (gameState, player) =>
      gameState.players.filter((p) => p.isAlive).map((p) => p.id),
  },
  murder: {
    name: 'murder',
    label: 'Murder',
    defaultQuantity: 1,
    getValidTargets: (gameState, player) =>
      gameState.players
        .filter((p) => p.isAlive && p.id !== player.id)
        .map((p) => p.id),
  },
  save: {
    name: 'save',
    label: 'Save',
    defaultQuantity: 1,
    getValidTargets: (gameState, player) =>
      gameState.players
        .filter((p) => p.isAlive && p.id !== player.id)
        .map((p) => p.id),
  },
  investigate: {
    name: 'investigate',
    label: 'Investigate',
    defaultQuantity: Infinity,
    getValidTargets: (gameState, player) =>
      gameState.players
        .filter((p) => p.isAlive && p.id !== player.id)
        .map((p) => p.id),
  },
};

/** -------------------
 * Roles
 * ------------------- */
export const ROLES = [
  {
    name: 'NORMIE',
    team: TEAMS.CIRCLE.name,
    color: TEAMS.CIRCLE.color,
    actions: ['vote'],
  },
  {
    name: 'MURDERER',
    team: TEAMS.MURDERERS.name,
    color: TEAMS.MURDERERS.color,
    actions: ['vote', 'murder'],
  },
  {
    name: 'DETECTIVE',
    team: TEAMS.CIRCLE.name,
    color: '#4caf50',
    actions: ['vote', 'investigate'],
  },
  {
    name: 'DOCTOR',
    team: TEAMS.CIRCLE.name,
    color: '#ff9800',
    actions: ['vote', 'save'],
  },
];

/** -------------------
 * Role Pool & Minimums
 * ------------------- */
export const ROLE_POOL = ROLES.map((r) => r.name);

export const ROLE_MINIMUMS = {
  1: ['MURDERER'],
  2: ['MURDERER'],
  3: ['MURDERER'],
  4: ['MURDERER', 'DETECTIVE'],
  5: ['MURDERER', 'DETECTIVE'],
  6: ['MURDERER', 'DETECTIVE'],
  7: ['MURDERER', 'MURDERER', 'DETECTIVE'],
  8: ['MURDERER', 'MURDERER', 'DETECTIVE', 'DOCTOR'],
  9: ['MURDERER', 'MURDERER', 'DETECTIVE', 'DOCTOR'],
};

/** -------------------
 * Phases
 * ------------------- */
export const PHASES = [
  {
    name: 'day',
    description: 'Players discuss, vote, and confirm selections.',
    actions: ['vote'],
  },
  {
    name: 'night',
    description: 'Night actions occur (murders, investigations, etc.).',
    actions: ['murder', 'save', 'investigate'],
  },
];

/** -------------------
 * Event Types (UI / triggers)
 * ------------------- */
export const EVENT_TYPES = [
  { type: 'vote', label: 'Start Vote' },
  { type: 'murder', label: 'Start Murder' },
  { type: 'investigate', label: 'Start Investigation' },
  { type: 'save', label: 'Start Save' },
];
