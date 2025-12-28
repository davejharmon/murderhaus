// /shared/constants/actions.js
import { DIAL, CONFIRM, ACTION_KEYS } from './config.js';

export const ACTIONS = {
  VOTE: {
    name: 'vote',
    description: 'Vote for a player',
    input: { select: DIAL, confirm: CONFIRM },
    max: { perPhase: Infinity, perGame: Infinity },
    filter: ({ target, me }) => target !== me,
    resolution: ({ event, actor, selection }) => {
      event.vote(actor, selection);
      return { success: true };
    },
  },

  INVESTIGATE: {
    name: 'investigate',
    description: 'Investigate a player at night',
    input: { select: DIAL, confirm: CONFIRM },
    max: { perPhase: 1, perGame: Infinity },
    filter: ({ target, me }) => target !== me,
    resolution: ({ actor, selection }) => {
      actor.investigate(selection);
      return { success: true };
    },
  },

  PROTECT: {
    name: 'protect',
    description: 'Protect a player during night actions',
    input: { select: DIAL, confirm: CONFIRM },
    max: { perPhase: 1, perGame: Infinity },
    filter: ({ target, me }) => target !== me,
    resolution: ({ actor, selection }) => {
      actor.addProtection(selection);
      return { success: true };
    },
  },

  SUSPECT: {
    name: 'suspect',
    description: 'Select a player suspected of murder',
    input: { select: DIAL, confirm: CONFIRM },
    max: { perPhase: Infinity, perGame: Infinity },
    conditions: () => true,
    filter: ({ target, me }) => target !== me,
    resolution: ({ actor, selection }) => {
      actor.recordSuspect(selection);
      return { success: true };
    },
  },

  PARDON: {
    name: 'pardon',
    description: 'Pardon inmate? Y/N',
    input: { select: ACTION_KEYS, confirm: undefined },
    // input: first two available action keys from A, B, C. Confirm undefined (not required, act on action keypress immediately)
    max: { perPhase: 1, perGame: Infinity },
    filter: () => true, // only action keys bound to the pardon event
    resolution: ({ event, actor, selection }) => {
      if (selection === TRUE) {
      }
      // end the event early (no execution)
      // push pardon flow slides
    },
  },
};
