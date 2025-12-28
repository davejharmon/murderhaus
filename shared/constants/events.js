// /shared/constants/events.js
export const EVENTS = {
  ONESHOT: {
    name: 'oneshot',
    description: 'Choose a player to kill immediately',
    condition: ({ player, initiator }) => player === initiator,
    filter: ({ player, initiator }) => player !== initiator && !player.isDead,
    resolution: ({ target }) => {
      target.kill();
      return { success: true, message: 'Event ended' };
    },
  },

  VOTE_EXECUTE: {
    name: 'vote_execute',
    description: 'Public vote on who to execute',
    condition: ({ player }) => !player.isDead,
    filter: ({ player }) => !player.isDead,
    resolution: ({ target }) => {
      target.kill();
      return { success: true, message: 'Event ended' };
    },
  },

  VOTE_ASSIGN: {
    name: 'vote_assign',
    description: 'Assign a role to a player',
    condition: ({ player }) => !player.isDead,
    filter: ({ player }) => !player.isDead,
    resolution: ({ event, game, role, target }) => {
      target.assignRole(role);
      return game.resolveEvent(event);
    },
  },

  NIGHT_ACTIONS: {
    name: 'night_actions',
    description: 'All night actions are resolved simultaneously',
    condition: ({ player }) => !player.isDead,
    filter: () => true,
    resolution: ({ game }) => game.resolveNightActions(),
  },

  PARDON: {
    name: 'pardon',
    description: 'Pardons a player during an execution vote',
    condition: ({ player, initiator }) => player === initiator,
    filter: ({ target }) => target.isDead,
    resolution: ({ event, game, target }) => {
      game.startEvent;
      return game.resolveEvent(event);
    },
  },
};
