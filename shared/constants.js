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
    trigger: 'event', // event (host triggers) | interrupt (any time)
    input: {
      allowed: ['1', '2', '3', '4', '5', '6', '7', '8', '9'], // selectable target
      allowNone: false,
      confirmReq: true, // requires confirm click to submit
    },
    uses: Infinity,
    usesPerPhase: 1,
    conditions: ({ actor, target }) => actor?.isAlive && target?.isAlive,
    result: (actor, action, target) => {
      action.selectedTarget = target.id;
      action.confirmed = true;
    },
  },

  kill: {
    name: 'kill',
    trigger: 'event',
    input: {
      allowed: ['1', '2', '3', '4', '5', '6', '7', '8', '9'],
      allowNone: false,
      confirmReq: true,
    },
    uses: Infinity,
    usesPerPhase: 1,
    conditions: ({ actor, target }) =>
      actor?.state.isAlive && target?.state.isAlive,
    result: (actor, action, target) => {
      action.selectedTarget = target.id;
      action.confirmed = true;
      target.state.isAlive = false;
      target.state.diedThisTurn = true;
    },
  },

  protect: {
    name: 'protect',
    trigger: 'event',
    input: {
      allowed: ['1', '2', '3', '4', '5', '6', '7', '8', '9'],
      allowNone: true,
      confirmReq: true,
    },
    uses: Infinity,
    usesPerPhase: 1,
    conditions: ({ actor, target }) => actor?.isAlive && target?.isAlive,
    result: (actor, action, target) => {
      action.selectedTarget = target.id;
      action.confirmed = true;
    },
  },

  investigate: {
    name: 'investigate',
    trigger: 'event',
    input: {
      allowed: ['1', '2', '3', '4', '5', '6', '7', '8', '9'],
      allowNone: true,
      confirmReq: true,
    },
    uses: Infinity,
    usesPerPhase: 1,
    conditions: ({ actor, target }) => actor?.isAlive && target?.isAlive,
    result: (actor, action, target) => {
      action.selectedTarget = target.id;
      action.confirmed = true;
    },
  },

  commute: {
    name: 'commute',
    trigger: 'interrupt',
    input: {
      allowed: ['A', 'B'],
      allowNone: true,
      confirmReq: true,
    },
    uses: Infinity,
    usesPerPhase: 1,
    conditions: ({ actor }) => actor?.isAlive,
    result: (actor, action, target) => {
      action.selectedTarget = target.id;
      action.confirmed = true;
    },
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
