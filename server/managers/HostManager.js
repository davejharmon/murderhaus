// import { HOST_ACTIONS, HOST_CONTROLS } from '../../shared/constants/index.js';
// import { logger as Log } from '../utils/Logger.js';

// // const ACTION_EXECUTORS = {
// //   KILL_PLAYER: (gm, player) => gm.gameLogicManager.killPlayer(player),
// //   REZ_PLAYER: (gm, player) => gm.gameLogicManager.rezPlayer(player),
// //   ASSIGN_ROLE: (gm, player) => gm.gameLogicManager.assignRole(player, 'DOCTOR'),
// //   RENAME_PLAYER: (gm, player, value) => {
// //     player.name = value;
// //   },
// // };

// export class HostManager {
//   constructor(gameManager) {
//     this.gameManager = gameManager;
//   }

//   getAvailable(player) {}

//   // // -------------------------
//   // // Compute host controls based on game context
//   // // -------------------------
//   // getAvailableControls(ctx = {}) {
//   //   return Object.values(HOST_CONTROLS).flatMap((control) => {
//   //     // Dynamic controls
//   //     if (control.getButtons) return control.getButtons(ctx);

//   //     // Simple controls
//   //     if (control.condition?.(ctx)) {
//   //       return [
//   //         {
//   //           id: control.id,
//   //           label: control.label,
//   //           send: { type: 'HOST_CONTROL', payload: { id: control.id } },
//   //         },
//   //       ];
//   //     }

//   //     return [];
//   //   });
//   // }

// //   refresh(playerId) {
// //     // refresh host actions for players
// //     if (playerId != null) {
// //       const player = this.gameManager.getPlayer(playerId);
// //       if (player) player.availableHostActions = this.getAvailable(player);
// //     } else {
// //       for (const player of this.gameManager.game.players.values()) {
// //         player.availableHostActions = this.getAvailable(player);
// //       }
// //     }
// //   }
// // }
