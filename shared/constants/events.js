// shared/constants/events.js
const ACTION_WINDOW = {
  name: 'ACTION_WINDOW',
  description: 'Players perform actions for this event',
  phase: ['ANY'],
  inputs: {},
  resolution: {
    collect: 'all',
    order: [],
    apply: ({ event, game, outcome }) => {
      event.def.resolution.order.forEach((actionName) => {
        const tally = event.tally(actionName);
        const target = tally.highest();
        if (target) outcome({ target, event, game, actionName });
      });
    },
  },
};

export const EVENTS = {
  ACTION_WINDOW,

  NIGHT_ACTION_WINDOW: {
    ...ACTION_WINDOW,
    name: 'NIGHT_ACTION_WINDOW',
    description: 'All night role actions',
    phase: ['NIGHT'],
    resolution: {
      collect: 'all',
      order: ['PROTECT', 'KILL'], // priority order
      apply: ({ event, game }) => {
        event.resolveEffects(game);
      },
    },
  },
  NIGHT_MURDER_VOTE: {
    name: 'NIGHT_MURDER_VOTE',
    phase: ['NIGHT'],
    onTie: 'TIEBREAKER',
    resolution: { collect: 'vote', order: ['KILL'] },
    grants: [
      { action: 'KILL', to: ({ game }) => game.getPlayersByRole('murderer') },
    ],
  },
  DAY_LYNCH: {
    name: 'DAY_LYNCH',
    phase: ['DAY'],
    steps: [
      {
        name: 'VOTE',
        collect: 'vote',
        resolution: ({ event, game }) => {
          const topVoters = event.tally('VOTE').highest();
          event.state.pendingKills = topVoters.map((id) =>
            game.getPlayerById(id)
          );
          return { success: true };
        },
      },
      {
        name: 'PARDON',
        collect: 'any',
        resolution: ({ event, game }) => {
          const pardons = event.state.results.get('PARDON') || [];
          pardons.forEach(({ target }) => {
            event.state.pendingKills = event.state.pendingKills.filter(
              (p) => p.id !== target.id
            );
          });
          return { success: true };
        },
      },
      {
        name: 'RESOLVE_DEATHS',
        resolution: ({ event, game }) => {
          event.state.pendingKills.forEach((player) => game.kill(player));
          return { success: true };
        },
      },
    ],
  },
};
