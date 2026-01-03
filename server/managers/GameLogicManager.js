// // /server/managers/GameLogicManager.js
// import { logger as Log } from '../utils/Logger.js';

// export class GameLogicManager {
//   constructor(gameManager) {
//     this.gameManager = gameManager;
//   }

//   /** Kill a player */
//   kill(player) {
//     if (player.isDead)
//       return { success: false, message: 'Player already dead' };

//     player.isDead = true;
//     player.phaseDied = this.gameManager.game.getPhase()?.name;

//     Log.system(`Player killed: ${player.name}`, { player });

//     // Refresh host actions after state change
//     this.gameManager.hostManager.refresh(player.id);
//     this.gameManager.update();

//     return { success: true };
//   }

//   /** Resurrect a player */
//   rezz(player) {
//     if (!player.isDead)
//       return { success: false, message: 'Player is not dead' };

//     player.isDead = false;
//     player.phaseDied = undefined;

//     Log.system(`Player resurrected: ${player.name}`, { player });

//     this.gameManager.hhostManagerostActionManager.refresh(player.id);
//     this.gameManager.update();

//     return { success: true };
//   }

//   /** Assign a role to a player */
//   assignRole(player, roleName) {
//     player.assignRole(roleName);

//     Log.system(`Role assigned: ${roleName} → ${player.name}`, { player });

//     this.gameManager.hostManager.refresh(player.id);
//     this.gameManager.update();

//     return { success: true };
//   }

//   /** Example: add item to a player's inventory */
//   giveItem(player, itemName) {
//     if (!player || !itemName) return false;
//     player.addItem(itemName);
//     Log.system(`[GAME_LOGIC] Gave Item: ${itemName} to ${player.name}`);
//     this.gameManager.update();
//     return { success: true };
//   }

//   /** Example: remove item from inventory */
//   removeItem(player, itemName) {
//     if (!player || !itemName) return false;
//     player.removeItem(itemName);
//     Log.system(`[GAME_LOGIC] Removed item: ${itemName} from ${player.name}`);
//     this.gameManager.update();
//     return { success: true };
//   }
// }
