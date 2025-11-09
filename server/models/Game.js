// server/models/Game.js
import {
  MAX_PLAYERS,
  PHASES,
  MINIMUM_ROLES,
  ROLES,
  DEFAULT_ROLE,
} from '../../shared/constants.js';
import { Player } from './Player.js';

export class Game {
  constructor() {
    this.players = [];
    this.phaseIndex = 0;
    this.gameStarted = false;
    this.dayCount = 0;
  }

  /** Add a new player */
  addPlayer(id) {
    if (this.players.length > MAX_PLAYERS)
      return { success: false, message: 'Max players reached' };

    const player = new Player(id);
    this.players.push(player);
    return { success: true, message: `Player ${id} registered`, player };
  }

  /** Remove a player */
  removePlayer(id) {
    const index = this.players.findIndex((p) => p.id === id);
    if (index !== -1) {
      this.players.splice(index, 1);
      return { success: true, message: `Player ${id} removed` };
    }
    return { success: false, message: `Player ${id} not found` };
  }

  getPlayer(id) {
    return this.players.find((p) => p.id === id);
  }

  getCurrentPhase() {
    return PHASES[this.phaseIndex];
  }

  /** Start the game */
  start() {
    if (this.gameStarted)
      return { success: false, message: 'Game already started' };
    this.gameStarted = true;
    this.dayCount = 1;
    this.assignPlayers();
    return { success: true, message: 'Game started' };
  }

  assignPlayers() {
    const total = this.players.length;
    if (total < 1) return;

    const minimum = MINIMUM_ROLES[total] || {};
    const rolesToAssign = [];

    for (const [roleName, count] of Object.entries(minimum)) {
      for (let i = 0; i < count; i++) {
        rolesToAssign.push(ROLES[roleName]);
      }
    }

    while (rolesToAssign.length < total) {
      rolesToAssign.push(ROLES[DEFAULT_ROLE]);
    }

    // shuffle
    for (let i = rolesToAssign.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [rolesToAssign[i], rolesToAssign[j]] = [
        rolesToAssign[j],
        rolesToAssign[i],
      ];
    }

    this.players.forEach((player, index) => {
      const role = rolesToAssign[index];
      player.assignRole(role.name);
    });
  }

  /** Advance to next phase */
  nextPhase() {
    this.phaseIndex = (this.phaseIndex + 1) % PHASES.length;

    let message = `Phase advanced to ${this.getCurrentPhase().name}`;
    if (this.getCurrentPhase().name === 'day') {
      this.dayCount++;
      message = `Phase advanced to day. It is now day ${this.dayCount}`;
    }

    return {
      success: true,
      message,
    };
  }

  /** Host actions (kick/kill/revive) */
  hostAction(playerId, action) {
    const player = this.getPlayer(playerId);
    if (!player)
      return {
        success: false,
        message: `Host action failed: player ${playerId} not found`,
      };

    let msg = '';
    if (action === 'kick') {
      this.removePlayer(playerId);
      msg = `Player ${playerId} kicked`;
    } else if (action === 'kill') {
      player.isAlive = false;
      msg = `Player ${playerId} killed`;
    } else if (action === 'revive') {
      player.isAlive = true;
      msg = `Player ${playerId} revived`;
    } else {
      return { success: false, message: `Unknown host action: ${action}` };
    }

    return { success: true, message: msg };
  }

  /** Player selects a target */
  playerAction(playerId, actionType, targetId) {
    const player = this.getPlayer(playerId);
    if (!player)
      return { success: false, message: `Player ${playerId} not found` };

    if (!player.availableActions.some((a) => a.name === actionType)) {
      return {
        success: false,
        message: `Invalid action ${actionType} for player ${playerId}`,
      };
    }

    player.selections[actionType] = targetId;
    return {
      success: true,
      message: `Player ${playerId} selected ${targetId} for ${actionType}`,
    };
  }

  /** Player confirms an action */
  playerConfirm(playerId, actionType) {
    const player = this.getPlayer(playerId);
    if (!player)
      return { success: false, message: `Player ${playerId} not found` };

    const selection = player.selections[actionType];
    if (selection == null)
      return {
        success: false,
        message: `No selection to confirm for ${actionType}`,
      };

    player.confirmedSelections[actionType] = selection;
    return {
      success: true,
      message: `Player ${playerId} confirmed ${actionType}`,
    };
  }

  /** Player uses interrupt */
  playerInterrupt(playerId, actionName) {
    const player = this.getPlayer(playerId);
    if (!player)
      return { success: false, message: `Player ${playerId} not found` };

    player.interruptUsedMap = player.interruptUsedMap || {};
    if (player.interruptUsedMap[actionName]) {
      return {
        success: false,
        message: `Player ${playerId} tried to use ${actionName} but it's already used`,
      };
    }

    player.interruptUsedMap[actionName] = true;
    return {
      success: true,
      message: `Player ${playerId} used interrupt ${actionName}`,
    };
  }

  getState() {
    return {
      dayCount: this.dayCount,
      phase: this.getCurrentPhase().name,
      gameStarted: this.gameStarted,
      players: this.players.map((p) => p.getPublicState()),
    };
  }
}
