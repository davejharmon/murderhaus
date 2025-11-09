// /shared/constants.js

export const MAX_PLAYERS = 9; // Max players and max selectable buttons per player

// Game phases
export const PREGAME_HOST_ACTIONS = ['kick', 'assign'];
export const PHASES = [
  {
    name: 'day',
    description: 'Players discuss and vote on whom to lynch.',
    validActions: ['vote', 'interrupt'], // actions players can take during the day
    validHostActions: ['kill', 'revive'],
  },
  {
    name: 'night',
    description: 'Special roles perform their night abilities.',
    validActions: ['kill', 'protect', 'investigate', 'interrupt'], // placeholder for night actions
    validHostActions: ['kill', 'revive'],
  },
];

// Teams
export const TEAMS = {
  villagers: {
    name: 'Villagers',
    color: '#4db8ff', // cooler modern blue for villagers
  },
  werewolves: {
    name: 'Werewolves',
    color: '#ff6b6b', // warm red/orange for werewolves
  },
};

// --- Player Actions ---
export const ACTIONS = {
  vote: {
    type: 'selection',
    alwaysAvailable: false,
    maxPerPhase: 1,
    conditions: (player) => player.isAlive,
  },

  kill: {
    type: 'selection',
    alwaysAvailable: true,
    maxPerPhase: 1,
    conditions: (player) => player.isAlive,
  },

  protect: {
    type: 'selection',
    alwaysAvailable: true,
    maxPerPhase: 1,
    conditions: (player, game, target) =>
      player.isAlive &&
      target?.id !== player.id && // target safe
      game?.getCurrentPhase()?.name === 'night', // phase safe
  },

  investigate: {
    type: 'selection',
    alwaysAvailable: true,
    maxPerPhase: 1,
    conditions: (player, game, target) =>
      player.isAlive &&
      target?.id !== player.id &&
      game?.getCurrentPhase()?.name === 'night',
  },

  commute: {
    type: 'interrupt',
    alwaysAvailable: true,
    maxPerPhase: 1,
    conditions: (player, game) =>
      player?.isAlive && game?.activeEvent?.type === 'vote',
  },
};

// --- Roles ---
export const ROLES = {
  villager: {
    name: 'villager',
    team: 'villagers',
    color: undefined, // fallback to team
    defaultActions: ['vote'],
  },
  werewolf: {
    name: 'werewolf',
    team: 'werewolves',
    color: undefined, // fallback to team
    defaultActions: ['kill', 'vote'],
  },
  seer: {
    name: 'seer',
    team: 'villagers',
    color: '#a1ff9b', // pleasant mint green
    defaultActions: ['investigate', 'vote'],
  },
  doctor: {
    name: 'doctor',
    team: 'villagers',
    color: '#9be2ff', // soft cyan
    defaultActions: ['protect', 'vote'],
  },
  governor: {
    name: 'governor',
    team: 'villagers',
    color: '#ffc27b', // warm but still friendly amber
    defaultActions: ['commute'],
  },
};
// Minimum roles for auto-start, based on total players. Will assign roles until roles in game are greater than equal to each minimum, starting with the first key/value pair and only if sufficient roles of each type have not been assigned by the Host. All remaining roles will be ROLES[0].
export const MINIMUM_ROLES = {
  4: { werewolf: 1, seer: 1 }, // example, 4-player game
  5: { werewolf: 1, seer: 1 },
  6: { werewolf: 1, seer: 1 },
  7: { werewolf: 1, seer: 1 },
  8: { werewolf: 2, seer: 1 },
  9: { werewolf: 2, seer: 1, doctor: 1 },
};

export const DEFAULT_ROLE = 'villager';
