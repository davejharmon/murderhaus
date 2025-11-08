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
    color: '#00ff00', // fallback color
  },
  werewolves: {
    name: 'Werewolves',
    color: '#ff0000', // fallback color
  },
};

// Roles
export const ROLES = {
  villager: {
    name: 'villager',
    team: TEAMS.villagers,
    color: TEAMS.villagers.color,
    defaultActions: ['vote'],
  },
  werewolf: {
    name: 'werewolf',
    team: TEAMS.werewolves,
    color: TEAMS.werewolves.color,
    defaultActions: ['kill', 'vote'],
  },
  seer: {
    name: 'seer',
    team: TEAMS.villagers,
    color: '#00ffff', // optional custom color
    defaultActions: ['investigate', 'vote'],
  },
  doctor: {
    name: 'doctor',
    team: TEAMS.villagers,
    color: '#ffff00', // optional custom color
    defaultActions: ['protect', 'vote'],
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
