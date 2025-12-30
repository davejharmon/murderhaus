// /shared/constants/hostActions.js
export const HOST_ACTIONS = {
  KILL_PLAYER: {
    label: 'Kill Player',
    conditions: ({ player }) => !player.isDead,
    options: { target: 'PLAYER', metaphase: 'GAME' },
  },

  REZ_PLAYER: {
    label: 'Resurrect Player',
    conditions: ({ player }) => player.isDead,
    options: { target: 'PLAYER', metaphase: 'GAME' },
  },

  ASSIGN_ROLE: {
    label: '🧑‍⚕️',
    options: { target: 'PLAYER', metaphase: 'GAME' },
  },

  RENAME_PLAYER: {
    label: 'Rename Player',
    options: { target: 'PLAYER', metaphase: 'GAME', input: 'STRING' },
  },
};
