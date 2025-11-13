// // /shared/helpers.js
// import { PHASES } from './constants.js';

// export const getCurrentPhase = (game) =>
//   PHASES.find((p) => p.name === game.phase) || null;

// export const getNextPhase = (game) => {
//   const index = PHASES.findIndex((p) => p.name === game.phase);
//   return index >= 0 && index < PHASES.length - 1
//     ? PHASES[index + 1]
//     : PHASES[0];
// };

// export const getActionsForPhase = (phaseName, role) => {
//   const phase = PHASES.find((p) => p.name === phaseName);
//   if (!phase) return [];
//   return (role?.defaultActions || []).filter((a) =>
//     phase.playerActions.includes(a)
//   );
// };

// export const isAlive = (player) => !!(player && player.isAlive);
