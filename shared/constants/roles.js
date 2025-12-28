// /shared/constants/roles.js
export const ROLES = {
  villager: {
    name: 'villager',
    team: 'villagers',
    color: undefined,
    defaultActions: [],
    defaultEvents: ['vote', 'suspect'],
  },
  murderer: {
    name: 'murderer',
    team: 'murderers',
    color: '#ff6b6b',
    defaultActions: [],
    defaultEvents: ['vote', 'kill'],
  },
  detective: {
    name: 'detective',
    team: 'villagers',
    color: '#a1ff9b',
    defaultActions: [],
    defaultEvents: ['vote', 'protect'],
  },
  doctor: {
    name: 'doctor',
    team: 'villagers',
    color: '#9be2ff',
    defaultActions: [],
    defaultEvents: ['vote', 'protect'],
  },
};
