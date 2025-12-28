// /shared/constants/interrupts.js
import { ACTION_KEYS } from './config.js';

export const INTERRUPTS = {
  PISTOL_KILL: {
    name: 'pistol_kill',
    description: 'Interrupt day to kill a player',
    input: { interrupt: ACTION_KEYS[0] },
    max: { perPhase: 1, perGame: 1 },
    conditions: ({ game, actor }) =>
      game.phase === 'day' && actor.hasItem('PISTOL'),
    resolution: ({ game, actor }) => {
      game.startEvent('oneshot', actor);
      return { success: true };
    },
  },
};
