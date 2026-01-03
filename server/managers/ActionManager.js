// // /server/managers/ActionManager.js
export class ActionManager {
  constructor(game) {
    this.player = player;
  }

  giveAction(playerId, actionName) {
    const player = this.game.getPlayer(playerId);
    if (!player)
      return {
        success: false,
        message: 'Cannot give action, player not found',
      };
    // TODO: If action isn't already present in actions

    return player.addAction(actionName, this.game);
  }
}
