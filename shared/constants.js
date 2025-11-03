// shared/constants.js

export const MAX_PLAYERS = 9;

export const PHASES = [
  {
    name: 'daybreak',
    description: 'Everyone awakes. Morning spiel.',
    actions: [],
  },
  { name: 'morning', description: 'Night actions are revealed.', actions: [] },
  { name: 'noon', description: 'Players discuss who to kill.', actions: [] },
  { name: 'afternoon', description: 'Voting begins.', actions: ['vote'] },
  { name: 'evening', description: 'Votes are revealed.', actions: [] },
  { name: 'nightfall', description: 'Everyone sleeps.', actions: [] },
  {
    name: 'midnight',
    description: 'Night actions occur.',
    actions: ['murder'],
  },
];

// Map phase names for convenience
export const PHASE_NAMES = PHASES.map((p) => p.name);
export const PHASE_DESCRIPTIONS = PHASES.reduce((acc, p) => {
  acc[p.name] = p.description;
  return acc;
}, {});
export const PHASE_ACTIONS = PHASES.reduce((acc, p) => {
  acc[p.name] = p.actions;
  return acc;
}, {});

// Teams
export const TEAMS = [
  { name: 'CIRCLE', color: '#1976d2' },
  { name: 'MURDERERS', color: '#d32f2f' },
];

// Roles
export const ROLES = [
  {
    name: 'NORMIE',
    team: 'CIRCLE',
    color: '#1976d2',
    actions: ['vote'],
  },
  {
    name: 'MURDERER',
    team: 'MURDERERS',
    color: '#d32f2f',
    actions: ['vote', 'murder'],
  },
];

// Generate role pool automatically
export const ROLE_POOL = ROLES.map((r) => r.name);

// Compute minimum roles dynamically
export const ROLE_MINIMUMS = {};
for (let n = 1; n <= MAX_PLAYERS; n++) {
  ROLE_MINIMUMS[n] = ['MURDERER', ...(n > 6 ? ['MURDERER'] : [])]; // example: 2 murderers if players > 6
}
