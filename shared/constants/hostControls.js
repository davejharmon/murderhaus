export const HOST_CONTROLS = {
  // -------------------------
  // Phase/Metaphase controls
  // -------------------------
  START_GAME: {
    id: 'START_GAME',
    label: 'Start Game',
    type: 'game',
    condition: (ctx) => ctx.metaphase !== 'GAME',
    disabledReason: 'Game has already started',
    execute: (gm) => gm.phaseManager.startGame(),
  },

  NEXT_PHASE: {
    id: 'NEXT_PHASE',
    label: 'Next Phase',
    type: 'game',
    condition: (ctx) => ctx.metaphase === 'GAME',
    disabledReason: 'Game has not started yet',
    execute: (gm) => gm.phaseManager.nextPhase(),
  },

  // -------------------------
  // Slide Controls
  // -------------------------
  NEXT_SLIDE: {
    id: 'NEXT_SLIDE',
    label: `Next Slide`,
    type: 'game',
    condition: ({ active, buffer }) => active < buffer.length - 1,
    disabledReason: 'No slides remaining',
    execute: ({ gm }) => gm.slideManager.nextSlide(),
  },
  PREV_SLIDE: {
    id: 'PREV_SLIDE',
    label: 'Previous Slide',
    type: 'game',
    condition: ({ active }) => active > 0,
    disabledReason: 'Already at first slide',
    execute: ({ gm }) => gm.slideManager.prevSlide(),
  },
  LAST_SLIDE: {
    id: 'LAST_SLIDE',
    label: 'Last Slide',
    type: 'game',
    condition: ({ buffer, active }) => buffer.length - 1 > active,
    disabledReason: 'Already at last slide',
    execute: ({ gm }) => gm.slideManager.lastSlide(),
  },

  // -------------------------
  // Event Controls
  // -------------------------

  START_EVENT: {
    id: 'START_EVENT',
    label: 'Start Event',
    type: 'game',
    condition: () => true,
    disabledReason: 'No events ready to start',
    execute: ({ gm, eventName }) => gm.eventManager.startEvent(eventName),
  },

  RESOLVE_EVENT: {
    id: 'RESOLVE_EVENT',
    label: 'Resolve Event',
    type: 'game',
    condition: () => true,
    disabledReason: 'No events ready to resolve',
    execute: ({ gm, eventId }) => gm.eventManager.startEvent(eventId),
  },

  // START_EVENT: {
  //   // TO DO: Fix me to just send one event
  //   id: 'START_EVENT',
  //   type: 'game',
  //   getButtons: ({ availableEvents = [] }) =>
  //     availableEvents.map((eventName) => ({
  //       id: `START_EVENT:${eventName}`,
  //       label: `Start ${eventName.replaceAll('_', ' ')}`,
  //       send: {
  //         type: 'START_EVENT',
  //         payload: { eventName },
  //       },
  //     })),
  //   execute: ({ gm, ctx }) => gm.startEvent(ctx.eventName),
  // },

  // RESOLVE_EVENT: {
  //   // TO DO: Fix me to just send one event
  //   id: 'RESOLVE_EVENT',
  //   type: 'game',
  //   getButtons: ({ activeEvents = [] }) =>
  //     activeEvents.map((eventName) => ({
  //       id: `RESOLVE_EVENT:${eventName}`,
  //       label: `Resolve ${eventName.replaceAll('_', ' ')}`,
  //       send: {
  //         type: 'RESOLVE_EVENT',
  //         payload: { eventName },
  //       },
  //     })),
  //   execute: ({ gm, ctx }) => gm.resolveEvent(ctx.eventId),
  // },

  // NEXT SLIDE
  // PREV SLIDE
  // LAST SLIDE
  // END GAME
  // RESTART GAME

  // -------------------------
  // Player Controls
  // -------------------------
  RENAME_PLAYER: {
    id: 'RENAME_PLAYER',
    label: 'Rename Player',
    type: 'player',
    condition: () => true,
    disabledReason: 'Write me',
    execute: ({ gm, ctx }) => gm.updatePlayerName(ctx.eventId, ctx.newName),
  },
};
