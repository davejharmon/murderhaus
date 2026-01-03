// /shared/constants/roles.js
export const ROLES = {
  VILLAGER: {
    name: 'VILLAGER',
    team: 'VILLAGERS',
    color: undefined,
    grants: [
      // Villagers usually only vote
      { action: 'VOTE', events: ['DAY_LYNCH'] },
    ],
  },

  MURDERER: {
    name: 'MURDERER',
    team: 'MURDERERS',
    color: '#ff6b6b',
    grants: [
      { action: 'VOTE', events: ['NIGHT_MURDER_VOTE'] },
      { action: 'VOTE', events: ['DAY_LYNCH'] },
    ],
  },

  DETECTIVE: {
    name: 'DETECTIVE',
    team: 'VILLAGERS',
    color: '#a1ff9b',
    grants: [
      { action: 'INVESTIGATE', events: ['NIGHT_ACTION_WINDOW'] }, // implement later
      { action: 'VOTE', events: ['DAY_LYNCH'] },
    ],
  },

  DOCTOR: {
    name: 'DOCTOR',
    team: 'VILLAGERS',
    color: '#9be2ff',
    grants: [
      { action: 'PROTECT', events: ['NIGHT_ACTION_WINDOW'] },
      { action: 'VOTE', events: ['DAY_LYNCH'] },
    ],
  },

  VIGILANTE: {
    name: 'VIGILANTE',
    team: 'VILLAGERS',
    color: '#ffd700',
    grants: [
      { action: 'ONESHOT' }, // now uses the multi-step action
      { action: 'VOTE', events: ['DAY_LYNCH'] },
    ],
  },
};
