// export const PhaseManager = {
//   getHostOptions: (phase, player) => {
//     if (!phase) {
//       // pregame options
//       return [
//         {
//           label: 'Assign Murderer',
//           action: (playerId, send) =>
//             send('ASSIGN_ROLE', { playerId, role: 'MURDERER' }),
//         },
//         {
//           label: 'Assign Normie',
//           action: (playerId, send) =>
//             send('ASSIGN_ROLE', { playerId, role: 'NORMIE' }),
//         },
//       ];
//     }

//     // During game
//     if (player.isAlive === true) {
//       return [
//         {
//           label: 'Kill',
//           action: (playerId, send) => send('KILL_PLAYER', { playerId }),
//         },
//       ];
//     } else if (player.isAlive === false) {
//       return [
//         {
//           label: 'Revive',
//           action: (playerId, send) => send('REVIVE_PLAYER', { playerId }),
//         },
//       ];
//     }

//     // pre-game or unknown, no options
//     return [];
//   },
// };
