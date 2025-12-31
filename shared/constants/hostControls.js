/**
 * A HostControl may define:
 * - label + condition + execute (simple)
 * - OR getButtons(ctx) → array of button defs (dynamic)
 */

import { MAX_PLAYERS } from './config';

export const HOST_CONTROLS = {
  START_GAME: {
    id: 'START_GAME',
    label: 'Start Game',
    type: 'game',
    condition: ({ metaphase }) => metaphase !== 'GAME',
    disabledReason: 'Game has already started',
    execute: ({ gm }) => gm.startGame(),
  },
  NEXT_PHASE: {
    id: 'NEXT_PHASE',
    label: 'Next Phase',
    type: 'game',
    condition: ({ metaphase }) => metaphase === 'GAME',
    disabledReason: 'Game has not started yet',
    execute: ({ gm }) => gm.nextPhase(),
  },
  // Big screen slide controls
  NEXT_SLIDE: {
    id: 'NEXT_SLIDE',
    label: `Next Slide`,
    type: 'game',
    condition: ({ buffer, active }) => active < buffer.length - 1,
    disabledReason: 'No slides remaining',
    execute: ({ gm }) => gm.nextSlide(),
  },
  PREV_SLIDE: {
    id: 'PREV_SLIDE',
    label: 'Previous Slide',
    type: 'game',
    condition: ({ active }) => active > 0,
    disabledReason: 'Already at first slide',
    execute: ({ gm }) => gm.prevSlide(),
  },
  LAST_SLIDE: {
    id: 'LAST_SLIDE',
    label: 'Last Slide',
    type: 'game',
    condition: ({ buffer, active }) => buffer.length - 1 > active,
    disabledReason: 'Already at last slide',
    execute: ({ gm }) => gm.lastSlide(),
  },

  START_EVENT: {
    id: 'START_EVENT',
    type: 'game',
    getButtons: ({ availableEvents = [] }) =>
      availableEvents.map((eventName) => ({
        id: `START_EVENT:${eventName}`,
        label: `Start ${eventName.replaceAll('_', ' ')}`,
        send: {
          type: 'START_EVENT',
          payload: { eventName },
        },
      })),
    execute: ({ gm, ctx }) => gm.startEvent(ctx.eventName),
  },

  RESOLVE_EVENT: {
    id: 'RESOLVE_EVENT',
    type: 'game',
    getButtons: ({ activeEvents = [] }) =>
      activeEvents.map((eventName) => ({
        id: `RESOLVE_EVENT:${eventName}`,
        label: `Resolve ${eventName.replaceAll('_', ' ')}`,
        send: {
          type: 'RESOLVE_EVENT',
          payload: { eventName },
        },
      })),
    execute: ({ gm, ctx }) => gm.resolveEvent(ctx.eventId),
  },

  // NEXT SLIDE
  // PREV SLIDE
  // LAST SLIDE
  // END GAME
  // RESTART GAME

  // Per-player controls
  RENAME_PLAYER: {
    // ctx -> playerId, newName
    id: 'RENAME_PLAYER',
    label: 'Rename Player',
    type: 'player',
    condition: () => true,
    disabledReason: 'WRITE ME',
    execute: ({ gm, ctx }) => {},
  },
};
