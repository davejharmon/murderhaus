export const HOST_ACTIONS = {
  KILL_PLAYER: {
    label: 'Kill Player',
    requiresTarget: true,
    execute: ({ game, target }) => {
      game.kill(target);
    },
  },

  REZ_PLAYER: {
    label: 'Resurrect Player',
    requiresTarget: true,
    execute: ({ game, target }) => {
      target.isDead = false;
      target.phaseDied = undefined;
    },
  },

  KICK_PLAYER: {
    label: 'Kick Player',
    requiresTarget: true,
    execute: ({ game, target }) => {
      game.players.delete(target.id);
    },
  },

  RENAME_PLAYER: {
    label: 'Rename Player',
    requiresTarget: true,
    requiresInput: true,
    execute: ({ target, value }) => {
      target.name = value;
    },
  },

  SET_PLAYER_IMAGE: {
    label: 'Set Player Image',
    requiresTarget: true,
    requiresInput: true,
    execute: ({ target, value }) => {
      target.image = value;
    },
  },
};
