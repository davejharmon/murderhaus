// /shared/constants/roles.js
export const ROLES = {
  villager: {
    name: 'villager',
    team: 'villagers',
    color: undefined,
    grants: [
      // Villagers usually only vote
      { action: 'VOTE', events: ['DAY_LYNCH'] },
    ],
  },

  murderer: {
    name: 'murderer',
    team: 'murderers',
    color: '#ff6b6b',
    grants: [
      { action: 'VOTE', events: ['NIGHT_MURDER_VOTE'] },
      { action: 'VOTE', events: ['DAY_LYNCH'] },
    ],
  },

  detective: {
    name: 'detective',
    team: 'villagers',
    color: '#a1ff9b',
    grants: [
      { action: 'INVESTIGATE', events: ['NIGHT_ACTION_WINDOW'] }, // implement later
      { action: 'VOTE', events: ['DAY_LYNCH'] },
    ],
  },

  doctor: {
    name: 'doctor',
    team: 'villagers',
    color: '#9be2ff',
    grants: [
      { action: 'PROTECT', events: ['NIGHT_ACTION_WINDOW'] },
      { action: 'VOTE', events: ['DAY_LYNCH'] },
    ],
  },

  vigilante: {
    name: 'vigilante',
    team: 'villagers',
    color: '#ffd700',
    grants: [
      { action: 'ONESHOT' }, // now uses the multi-step action
      { action: 'VOTE', events: ['DAY_LYNCH'] },
    ],
  },
};
