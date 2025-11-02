// import { ROLES } from '../shared/constants.js';

// // PhaseManager.js
// export class PhaseManager {
//   static getHostOptions(phase) {
//     if (!phase) {
//       return [
//         {
//           label: 'Assign Murderer',
//           action: (playerId, send) =>
//             send('ASSIGN_ROLE', { id: playerId, role: 'MURDERER' }),
//         },
//         {
//           label: 'Assign Normie',
//           action: (playerId, send) =>
//             send('ASSIGN_ROLE', { id: playerId, role: 'NORMIE' }),
//         },
//       ];
//     }

//     // In-game host options
//     return [
//       {
//         label: 'Kill Player',
//         action: (playerId, send) => send('KILL_PLAYER', { id: playerId }),
//       },
//       {
//         label: 'Reveal Role',
//         action: (playerId, send) => send('REVEAL_ROLE', { id: playerId }),
//       },
//     ];
//   }
// }
