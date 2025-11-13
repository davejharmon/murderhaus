// server/models/Game.js
import {
  MAX_PLAYERS,
  PHASES,
  MINIMUM_ROLES,
  ROLES,
  DEFAULT_ROLE,
} from '../../shared/constants.js';
import { Player } from './Player.js';
import { logger } from '../utils/Logger.js';

export class Game {
  constructor() {
    this.players = [];
    this.phaseIndex = 0;
    this.dayCount = 0;
    this.gameStarted = false;
    this.currentEvents = [];
  }

  /** --- Player management --- */
  addPlayer(id) {
    if (this.players.length >= MAX_PLAYERS) {
      return { success: false, message: 'Max players reached' };
    }

    const player = new Player(id);
    this.players.push(player);
    return { success: true, message: `Player ${id} registered`, player };
  }

  removePlayer(id) {
    const index = this.players.findIndex((p) => p.id === id);
    if (index === -1)
      return { success: false, message: `Player ${id} not found` };

    this.players.splice(index, 1);
    return { success: true, message: `Player ${id} removed` };
  }

  updatePlayerName(id, name) {
    const player = this.getPlayer(id);
    if (!player) return { success: false, message: `Player ${id} not found` };
    player.name = name;
    return { success: true, message: `Player ${id} changed name to ${name}` };
  }

  getPlayer(id) {
    return this.players.find((p) => p.id === id) || null;
  }

  /** --- Phase management --- */
  getCurrentPhase() {
    const phase = PHASES[this.phaseIndex];
    if (!phase) {
      logger.log(
        `Invalid phaseIndex: ${this.phaseIndex}, resetting`,
        'error',
        'Game.getCurrentPhase'
      );
      return { name: null, playerActions: [], hostActions: [], events: [] };
    }
    return phase;
  }

  nextPhase() {
    this.phaseIndex = (this.phaseIndex + 1) % PHASES.length;
    if (this.getCurrentPhase().name === 'day') this.dayCount++;

    // Reset per-phase usage
    this.players.forEach((p) => {
      p.actionUsage = {};
      p.interruptUsedMap = {};
    });

    // Update available actions for all players
    this.players.forEach((p) =>
      p.update({
        phaseName: this.getCurrentPhase().name,
        gameStarted: this.gameStarted,
        game: this,
      })
    );

    return {
      success: true,
      message: `Phase advanced to ${this.getCurrentPhase().name}`,
    };
  }

  /** --- Game lifecycle --- */
  // In Game.js
  start() {
    if (this.gameStarted)
      return { success: false, message: 'Game already started' };
    if (this.players.length < 4)
      return { success: false, message: 'Not enough players' };

    this.gameStarted = true;
    this.dayCount = 1;
    this.phaseIndex = 0;

    this.assignRoles(); // roles are assigned but player updates are minimal

    return { success: true, message: 'Game started.' };
  }

  assignRoles() {
    const total = this.players.length;
    const minimum = MINIMUM_ROLES[total] || {};
    const rolesToAssign = [];

    // Minimum roles
    Object.entries(minimum).forEach(([roleName, count]) => {
      for (let i = 0; i < count; i++) rolesToAssign.push(ROLES[roleName]);
    });

    // Fill remaining with default role
    while (rolesToAssign.length < total)
      rolesToAssign.push(ROLES[DEFAULT_ROLE]);

    // Shuffle
    for (let i = rolesToAssign.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [rolesToAssign[i], rolesToAssign[j]] = [
        rolesToAssign[j],
        rolesToAssign[i],
      ];
    }

    // Assign to players
    this.players.forEach((player, idx) => {
      const role = rolesToAssign[idx];
      player.assignRole(role.name);
    });
  }

  /** --- Convenience helpers --- */
  getAlivePlayers() {
    return this.players.filter((p) => p.isAlive);
  }

  getPlayersByRole(roleName) {
    return this.players.filter((p) => p.role?.name === roleName);
  }

  isGameOver() {
    // Example: check if all werewolves dead or villagers lost
    const werewolvesAlive = this.getPlayersByRole('werewolf').some(
      (p) => p.isAlive
    );
    const villagersAlive = this.getPlayersByRole('villager').some(
      (p) => p.isAlive
    );
    return !werewolvesAlive || !villagersAlive;
  }
}
