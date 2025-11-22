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

    console.log(player, action);
    if (!action)
      return { success: false, message: `Unknown host action: ${actionName}` };

    if (!action.conditions({ player, game: this.game })) {
      return {
        success: false,
        message: `Cannot perform ${actionName} on ${player.name}`,
      };
    }

    // Execute the action
    const result = action.result(player, this.game);
    return { success: true, message: result };
  }

  /** Get available host actions for a player */
  getAvailableActions(player) {
    return Object.values(HOST_ACTIONS).filter((action) =>
      action.conditions({ player, game: this.game })
    );
  }
}
