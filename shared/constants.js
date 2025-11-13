// /shared/constants.js

export const MAX_PLAYERS = 9; // Max players and max selectable buttons per player

// --- Game Phases ---
export const PREGAME_HOST_ACTIONS = ['kick', 'assign'];

export const PHASES = [
  {
    name: 'day',
    description: 'Players discuss and vote on whom to lynch.',
    playerActions: ['vote'], // Player-usable actions
    hostActions: ['kill', 'revive'], // Host actions available anytime
    events: ['vote'], // Host can start these selection events
  },
  {
    name: 'night',
    description: 'Special roles perform their night abilities.',
    playerActions: ['kill', 'protect', 'investigate', 'commute'],
    hostActions: ['kill', 'revive'],
    events: ['kill', 'protect', 'investigate'],
  },
];

// --- Teams ---
export const TEAMS = {
  villagers: { name: 'Villagers', color: '#4db8ff' },
  werewolves: { name: 'Werewolves', color: '#ff6b6b' },
};

// --- Player Actions ---
export const ACTIONS = {
  vote: {
    name: 'vote',
    trigger: 'event', // event | interrupt
    returns: {
      type: 'player', // selectable target
      allowNone: false,
    },
    maxPerPhase: 1,
    maxPerGame: Infinity,
    conditions: ({ actor, target }) => actor?.isAlive && target?.isAlive,
  },

  kill: {
    name: 'kill',
    trigger: 'event',
    returns: { type: 'player' },
    maxPerPhase: 1,
    conditions: ({ actor, target }) => actor?.isAlive && target?.isAlive,
  },

  protect: {
    name: 'protect',
    trigger: 'event',
    returns: { type: 'player' },
    maxPerPhase: 1,
    conditions: ({ actor, target }) => actor?.isAlive && target?.isAlive,
  },

  investigate: {
    name: 'investigate',
    trigger: 'event',
    returns: { type: 'player' },
    maxPerPhase: 1,
    conditions: ({ actor, target }) => actor?.isAlive && target?.isAlive,
  },

  commute: {
    name: 'commute',
    trigger: 'interrupt',
    returns: { type: 'boolean' },
    maxPerPhase: 1,
    conditions: ({ actor }) => actor?.isAlive,
  },
};

// --- Roles ---
export const ROLES = {
  villager: {
    name: 'villager',
    team: 'villagers',
    color: undefined,
    defaultActions: ['vote'],
  },
  werewolf: {
    name: 'werewolf',
    team: 'werewolves',
    color: '#ff6b6b',
    defaultActions: ['kill', 'vote'],
  },
  seer: {
    name: 'seer',
    team: 'villagers',
    color: '#a1ff9b',
    defaultActions: ['investigate', 'vote'],
  },
  doctor: {
    name: 'doctor',
    team: 'villagers',
    color: '#9be2ff',
    defaultActions: ['protect', 'vote'],
  },
  governor: {
    name: 'governor',
    team: 'villagers',
    color: '#ffc27b',
    defaultActions: ['commute', 'vote'],
  },
};

// --- Minimum roles for auto-start ---
export const MINIMUM_ROLES = {
  4: { werewolf: 1, seer: 1 },
  5: { werewolf: 1, seer: 1 },
  6: { werewolf: 1, seer: 1 },
  7: { werewolf: 1, seer: 1 },
  8: { werewolf: 2, seer: 1 },
  9: { werewolf: 2, seer: 1, doctor: 1 },
};

export const DEFAULT_ROLE = 'villager';
