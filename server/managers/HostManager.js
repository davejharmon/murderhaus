import { HOST_ACTIONS, HOST_CONTROLS } from '../../shared/constants/index.js';
import { logger as Log } from '../utils/Logger.js';

// const ACTION_EXECUTORS = {
//   KILL_PLAYER: (gm, player) => gm.gameLogicManager.killPlayer(player),
//   REZ_PLAYER: (gm, player) => gm.gameLogicManager.rezPlayer(player),
//   ASSIGN_ROLE: (gm, player) => gm.gameLogicManager.assignRole(player, 'DOCTOR'),
//   RENAME_PLAYER: (gm, player, value) => {
//     player.name = value;
//   },
// };

export class HostManager {
  constructor(gameManager) {
    this.gameManager = gameManager;
  }

  getAvailable(player) {
    // return Object.entries(HOST_ACTIONS)
    //   .filter(([key, action]) => {
    //     const metaphaseOk =
    //       !action.options?.metaphase ||
    //       action.options.metaphase === this.gameManager.game.getMetaphase();
    //     const conditionsOk =
    //       !action.conditions ||
    //       action.conditions({ player, game: this.gameManager.game });
    //     return metaphaseOk && conditionsOk;
    //   })
    //   .map(([key]) => key);
  }

  // execute(actionKey, player, value) {
  //   const executor = ACTION_EXECUTORS[actionKey];
  //   if (!executor) return { success: false, message: 'Invalid action' };

  //   try {
  //     const result = executor(this.gameManager, player, value);
  //     player.availableHostActions = this.getAvailable(player);
  //     this.gameManager.update();
  //     return result ?? { success: true };
  //   } catch (err) {
  //     Log.error('Host action execution failed', {
  //       error: err,
  //       actionKey,
  //       player,
  //     });
  //     return { success: false, message: err.message };
  //   }
  // }

  /**
   * Execute a host control by id
   * ctx is optional context: { availableEvents, activeEvents, metaphase, buffer, active }
   */
  execute(type, id, ctx = {}) {
    let controlDef;
    switch (type) {
      case 'CONTROL': // acts on the game
        controlDef = HOST_CONTROLS[id];
        break;
      case 'ACTION': // acts on a player
        controlDef = HOST_ACTIONS[id];
        break;
      default:
        throw new Error(`Unknown host control type: ${type}`);
    }

    if (!controlDef) {
      throw new Error(`Unknown host control id: ${id}`);
    }
    return control.execute({ gm: this.gameManager, ctx });
    // Simple control with execute()
    if (control.conditions) {
    }

    // Dynamic controls with getButtons
    if (control.getButtons) {
      const buttons = control.getButtons(ctx);
      // You could return them for UI, or execute the first one if needed
      return buttons;
    }

    throw new Error(`Host control ${id} has no execute() or getButtons()`);
  }

  // -------------------------
  // Compute host controls based on game context
  // -------------------------
  getAvailableControls(ctx = {}) {
    return Object.values(HOST_CONTROLS).flatMap((control) => {
      // Dynamic controls
      if (control.getButtons) return control.getButtons(ctx);

      // Simple controls
      if (control.condition?.(ctx)) {
        return [
          {
            id: control.id,
            label: control.label,
            send: { type: 'HOST_CONTROL', payload: { id: control.id } },
          },
        ];
      }

      return [];
    });
  }

  refresh(playerId) {
    // refresh host actions for players
    if (playerId != null) {
      const player = this.gameManager.getPlayer(playerId);
      if (player) player.availableHostActions = this.getAvailable(player);
    } else {
      for (const player of this.gameManager.game.players.values()) {
        player.availableHostActions = this.getAvailable(player);
      }
    }
    // Refresh host controls
    const ctx = {
      metaphase: this.gameManager.game.getMetaphase(),
      buffer: this.gameManager.game.slides?.buffer ?? [],
      active: this.gameManager.game.slides?.active ?? 0,
      availableEvents: this.gameManager.eventManager.getAvailableEventNames(),
      activeEvents: this.gameManager.eventManager.getActiveEventNames(),
    };

    this.gameManager.hostControls = this.getAvailableControls(ctx);
  }
}
