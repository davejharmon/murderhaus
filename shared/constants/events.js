import { ACTIONS } from './actions.js';
import { OUTCOMES } from './outcomes.js';

export const ACTION_WINDOW_EVENT = {
  name: 'ACTION_WINDOW_EVENT',
  description: 'Players perform actions for this event',
  phase: ['ANY'],
  grants: [], // filled on event creation
  inputs: new Map(), // playerId → Map(actionName → input)
  steps: [], // optional; resolution in .resolution.apply
  resolution: {
    collect: 'all', // collect all actions from grants
    order: [], // empty = any order
    apply: ({ event, game }) => {
      event.def.resolution.order.forEach((actionName) => {
        const tally = event.tally(actionName);
        const top = tally.highest();
        if (top) {
          const action = ACTIONS[actionName];
          if (action?.resolution) {
            const actor = game.getPlayerById(top.actorId);
            const target = game.getPlayerById(top.id);
            action.resolution({ actor, target, game, event });
          }
        }
      });
    },
  },
  autoResolve: true,
};

export const HOTKEY_EVENT = {
  name: 'HOTKEY_EVENT',
  description: 'Event triggered immediately by a player hotkey',
  phase: ['ANY'],
  grants: [], // usually 1 actor-action pair
  steps: [], // populated per-action (e.g., ONESHOT)
  autoResolve: true, // resolves immediately if no input
  inputs: new Map(),
};

export const EVENTS = {
  ACTION_WINDOW_EVENT,
  HOTKEY_EVENT,

  NIGHT_ACTION_WINDOW: {
    ...ACTION_WINDOW_EVENT,
    name: 'NIGHT_ACTION_WINDOW',
    description: 'All night role actions',
    phase: ['NIGHT'],
    resolution: {
      collect: 'all',
      order: ['PROTECT', 'KILL'],
      apply: ({ event, game }) => {
        event.resolveEffects(game); // resolves all registered effects
      },
    },
  },

  NIGHT_MURDER_VOTE: {
    ...ACTION_WINDOW_EVENT,
    name: 'NIGHT_MURDER_VOTE',
    phase: ['NIGHT'],
    onTie: 'TIEBREAKER',
    grants: [
      {
        action: 'KILL',
        to: ({ game }) => game.getPlayersByRole('murderer'),
      },
    ],
    resolution: {
      collect: 'vote',
      order: ['KILL'],
      apply: ({ event, game }) => {
        const top = event.tally('KILL').highest();
        if (top) {
          const actor = game.getPlayerById(top.actorId);
          const target = game.getPlayerById(top.id);
          OUTCOMES.KILL({ actor, target, game });
        }
      },
    },
  },

  DAY_LYNCH: {
    ...ACTION_WINDOW_EVENT,
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
          pardons.forEach(({ actor, target }) => {
            OUTCOMES.PARDON({ actor, target, game });
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
          event.state.pendingKills.forEach((player) =>
            OUTCOMES.KILL({ actor: null, target: player, game })
          );
          return { success: true };
        },
      },
    ],
  },
};
