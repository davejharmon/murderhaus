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

  // -------------------------
  // Player Controls
  // -------------------------
  RENAME_PLAYER: {
    id: 'RENAME_PLAYER',
    label: '✍️ Rename',
    type: 'player',
    condition: (player) => true,
    disabledReason: 'Write me',
    execute: (gm, { playerId }) => gm.getPlayer(playerId).rename(newName),
  },

  KILL_PLAYER: {
    id: 'KILL_PLAYER',
    label: '🔪 Kill',
    type: 'player',
    condition: (player) => player.isDead === false,
    execute: (gm, { playerId }) => {
      gm.getPlayer(playerId).kill(gm.game.phaseIndex);
    },
  },

  REZ_PLAYER: {
    id: 'REZ_PLAYER',
    label: '🪦 Rezz',
    type: 'player',
    condition: (player) => player.isDead === true,
    execute: (gm, { playerId }) => {
      gm.getPlayer(playerId).rezz();
    },
  },

  ASSIGN_ROLE: {
    id: 'ASSIGN_ROLE',
    label: '🧑‍⚕️ Assign',
    type: 'player',
    condition: () => true,
    execute: (gm, { playerId }) => {
      gm.getPlayer(playerId).assignRole('DOCTOR');
    },
  },
};
