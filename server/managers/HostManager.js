// server/managers/HostManager.js
import { TEAMS } from '../../shared/constants.js';

const HOST_ACTIONS = {
  kick: {
    label: 'Kick Player',
    condition: () => true, // always allowed
    execute: (player, game) => game.removePlayer(player.id),
  },
  kill: {
    label: 'Kill Player',
    condition: (player) => player.isAlive,
    execute: (player) => {
      player.isAlive = false;
      return { success: true, message: `Player ${player.id} killed` };
    },
  },
  revive: {
    label: 'Revive Player',
    condition: (player) => !player.isAlive,
    execute: (player) => {
      player.isAlive = true;
      return { success: true, message: `Player ${player.id} revived` };
    },
  },
  // Future host actions can be added here easily
};

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

    if (!action.condition(player, this.game)) {
      return {
        success: false,
        message: `Cannot perform ${actionName} on this player`,
      };
    }

    // Execute the action
    return action.execute(player, this.game);
  }

  /** Return a list of available host actions for a player (e.g., for UI) */
  getAvailableActions(player) {
    return Object.entries(HOST_ACTIONS)
      .filter(([_, action]) => action.condition(player, this.game))
      .map(([key, action]) => key);
  }
}
