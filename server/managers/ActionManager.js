// /server/managers/ActionManager.js
export class ActionManager {
  constructor(game) {
    this.game = game;
  }

  /** Player performs a regular action on a target */
  performAction(playerId, actionName, targetId) {
    const player = this.game.getPlayer(playerId);
    if (!player) return { success: false, message: 'Player not found' };

    // Delegate to Player
    return player.performAction(actionName, this.game, targetId);
  }

  /** Player confirms their previous selection */
  confirmAction(playerId, actionName) {
    const player = this.game.getPlayer(playerId);
    if (!player) return { success: false, message: 'Player not found' };

    return player.confirmAction(actionName);
  }

  /** Player uses an interrupt-type action */
  performInterrupt(playerId, actionName) {
    const player = this.game.getPlayer(playerId);
    if (!player) return { success: false, message: 'Player not found' };

    return player.performInterrupt(actionName, this.game);
  }
}
