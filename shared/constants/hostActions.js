export const HOST_ACTIONS = {
  KILL_PLAYER: {
    label: 'Kill Player',
    execute: ({ game, target }) => {
      game.kill(target);
    },
    options: { target: 'PLAYER', metaphase: 'GAME' },
  },

  ASSIGN_ROLE: {
    label: '🧑‍⚕️',
    execute: ({ target }) => {
      target.assignRole('DOCTOR');
    },
    options: { target: 'PLAYER', metaphase: 'GAME' },
  },

  REZ_PLAYER: {
    label: 'Resurrect Player',
    execute: ({ game, target }) => {
      target.isDead = false;
      target.phaseDied = undefined;
    },
    options: { target: 'PLAYER', metaphase: 'GAME' },
  },

  KICK_PLAYER: {
    label: 'Kick Player',
    execute: ({ game, target }) => {
      game.players.delete(target.id);
    },
    options: { target: 'PLAYER', metaphase: 'PREGAME' },
  },

  RENAME_PLAYER: {
    label: 'Rename Player',
    execute: ({ target, value }) => {
      target.name = value;
    },
    options: { target: 'PLAYER', metaphase: 'GAME', input: 'STRING' },
  },

  SET_PLAYER_IMAGE: {
    label: 'Set Player Image',
    execute: ({ target, value }) => {
      target.image = value;
    },
    options: { target: 'PLAYER', metaphase: 'GAME', input: 'SELECT_IMAGE' },
  },
};
