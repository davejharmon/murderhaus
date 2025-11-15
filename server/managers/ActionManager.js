// /server/managers/ActionManager.js
export class ActionManager {
  constructor(game) {
    this.game = game;
  }

  /** Player uses an interrupt-type action */
  performInterrupt(playerId, actionName) {
    const player = this.game.getPlayer(playerId);
    if (!player) return { success: false, message: 'Player not found' };

    return player.performInterrupt(actionName, this.game);
  }
}
