// server/managers/HostManager.js
import { HOST_ACTIONS } from '../../shared/constants.js';

export class HostManager {
  constructor(game) {
    this.game = game;
  }

  /** Perform a host action on a player */
  performHostAction(playerId, actionName) {
    const player = this.game.getPlayer(playerId);
    if (!player) return { success: false, message: 'Player not found' };
    const action = HOST_ACTIONS[actionName];

    if (!action)
      return { success: false, message: `Unknown host action: ${actionName}` };

    if (!action.conditions({ player, game: this.game })) {
      return {
        success: false,
        message: `Cannot perform ${actionName} on ${player.name}`,
      };
    }

    action.result(player, this.game);

    // Execute the action
    return { succes: true, message: `Host ${actionName}ed ${player.name}` };
  }

  /** Get available host actions for a player */
  getAvailableActions(player) {
    return Object.values(HOST_ACTIONS).filter((action) =>
      action.conditions({ player, game: this.game })
    );
  }
}
