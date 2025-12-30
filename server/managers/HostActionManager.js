import { HOST_ACTIONS } from '../../shared/constants/index.js';
import { logger as Log } from '../utils/Logger.js';

const ACTION_EXECUTORS = {
  KILL_PLAYER: (gm, player) => gm.gameLogicManager.killPlayer(player),
  REZ_PLAYER: (gm, player) => gm.gameLogicManager.rezPlayer(player),
  ASSIGN_ROLE: (gm, player) => gm.gameLogicManager.assignRole(player, 'DOCTOR'),
  RENAME_PLAYER: (gm, player, value) => {
    player.name = value;
  },
};

export class HostActionManager {
  constructor(gameManager) {
    this.gameManager = gameManager;
  }

  getAvailable(player) {
    return Object.entries(HOST_ACTIONS)
      .filter(([key, action]) => {
        const metaphaseOk =
          !action.options?.metaphase ||
          action.options.metaphase === this.gameManager.game.getMetaphase();
        const conditionsOk =
          !action.conditions ||
          action.conditions({ player, game: this.gameManager.game });
        return metaphaseOk && conditionsOk;
      })
      .map(([key]) => key);
  }

  execute(actionKey, player, value) {
    const executor = ACTION_EXECUTORS[actionKey];
    if (!executor) return { success: false, message: 'Invalid action' };

    try {
      const result = executor(this.gameManager, player, value);
      player.availableHostActions = this.getAvailable(player);
      this.gameManager.update();
      return result ?? { success: true };
    } catch (err) {
      Log.error('Host action execution failed', {
        error: err,
        actionKey,
        player,
      });
      return { success: false, message: err.message };
    }
  }

  refresh(playerId) {
    if (playerId != null) {
      const player = this.gameManager.getPlayer(playerId);
      if (player) player.availableHostActions = this.getAvailable(player);
    } else {
      for (const player of this.gameManager.game.players.values()) {
        player.availableHostActions = this.getAvailable(player);
      }
    }
  }
}
