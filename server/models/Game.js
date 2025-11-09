// server/models/Game.js
import {
  MAX_PLAYERS,
  PHASES,
  MINIMUM_ROLES,
  ROLES,
  DEFAULT_ROLE,
  ACTIONS,
} from '../../shared/constants.js';
import { Player } from './Player.js';
import { logger } from '../utils/Logger.js'; // used for error catching only.
export class Game {
  constructor() {
    this.players = [];
    this.phaseIndex = 0;
    this.gameStarted = false;
    this.dayCount = 0;
  }

  /** Add a new player */
  addPlayer(id) {
    if (this.players.length >= MAX_PLAYERS)
      return { success: false, message: 'Max players reached' };

    const player = new Player(id);
    this.players.push(player);
    return { success: true, message: `Player ${id} registered`, player };
  }

  updatePlayerName(id, name) {
    const player = this.getPlayer(id);
    if (!player) {
      return { success: false, message: `Player ${id} not found` };
    }

    player.name = name;
    return { success: true, message: `Player ${id} changed name to ${name}` };
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
    const index = this.phaseIndex;

    // Validate phaseIndex
    if (typeof index !== 'number' || index < 0 || index >= PHASES.length) {
      logger.log(
        `Invalid phaseIndex detected: ${index}. Resetting to safe fallback.`,
        'error',
        'Game.getCurrentPhase()'
      );

      return { name: null, validActions: [], validHostActions: [] };
    }

    return PHASES[index];
  }

  /** Start the game */
  start() {
    if (this.gameStarted) {
      return { success: false, message: 'Game already started' };
    }

    if (this.players.length < 4) {
      return { success: false, message: 'Not enough players to start.' };
    }

    this.gameStarted = true;
    this.dayCount = 1;

    // Ensure first phase is always valid
    this.phaseIndex = 0; // start at day
    const phase = this.getCurrentPhase();

    this.assignPlayers();

    return {
      success: true,
      message: `Game started. It is now ${phase.name} ${this.dayCount}.`,
    };
  }

  /** Assign roles to players and initialize available actions */
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

    // shuffle roles
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
      // Assign initial actions from role
      player.actions = [...role.defaultActions];
      player.availableActions = []; // Will be calculated per phase
      player.actionUsage = {};
      player.interruptUsedMap = {};
    });
  }

  /** Advance to next phase */
  nextPhase() {
    this.phaseIndex = (this.phaseIndex + 1) % PHASES.length;

    // Reset per-phase usage
    this.players.forEach((p) => {
      p.actionUsage = {};
      p.interruptUsedMap = {};
    });

    let message = `Phase advanced to ${this.getCurrentPhase().name}`;
    if (this.getCurrentPhase().name === 'day') {
      this.dayCount++;
      message = `Phase advanced to day. It is now day ${this.dayCount}`;
    }

    return { success: true, message };
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

  /** Update per-phase available actions for all players */
  updatePlayerActions() {
    const phase = this.getCurrentPhase();
    this.players.forEach((player) => {
      player.availableActions = player.actions.filter((a) => {
        const actionDef = ACTIONS[a];
        if (!actionDef) return false;
        // Always available actions are allowed anytime their conditions are met
        if (actionDef.alwaysAvailable)
          return actionDef.conditions(player, this);
        // Otherwise only available if valid for the phase
        return (
          phase.validActions.includes(a) && actionDef.conditions(player, this)
        );
      });
    });
  }
}
