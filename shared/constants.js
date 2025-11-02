export const MAX_PLAYERS = 9;

export const PHASES = [
  'daybreak', // All awake
  'morning', // Reveal night actions
  'noon', // Discuss
  'afternoon', // Vote
  'evening', // Reveal vote results
  'nightfall', // All sleep
  'midnight', // Night Actions
];

export const PHASE_DESCRIPTIONS = {
  daybreak: 'Everyone awakes. Morning spiel.',
  morning: 'Night actions are revealed.',
  noon: 'Players discuss who to kill.',
  afternoon: 'Voting begins.',
  evening: 'Votes are revealed.',
  nightfall: 'Everyone sleeps.',
  midnight: 'Night actions occur.',
};

export const TEAMS = ['CIRCLE', 'MURDERERS'];

export const ROLES = [
  {
    name: 'NORMIE',
    team: 0,
    color: '#1976d2',
    actions: ['vote'],
  },
  {
    name: 'MURDERER',
    team: 1,
    color: '#d32f2f',
    actions: ['vote', 'murder'],
  },
];

export const ROLE_MINIMUMS = {
  1: ['MURDERER'],
  2: ['MURDERER'],
  3: ['MURDERER'],
  4: ['MURDERER'],
  5: ['MURDERER'],
  6: ['MURDERER'],
  7: ['MURDERER', 'MURDERER'],
  8: ['MURDERER', 'MURDERER'],
  9: ['MURDERER', 'MURDERER'],
};

// Optional role pool (extra roles you may add later)
export const ROLE_POOL = ['MURDERER']; // currently just Murderer, can add others

export const getPregameHostOptions = () =>
  ROLES.map((role) => ({
    label: `Assign ${role.name}`,
    role: role.name,
  }));
