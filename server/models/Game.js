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
    this.gameStarted = false;
    this.dayCount = 0;
    this.currentEvents = []; // stack of events
  }

  /** --- Player management --- */
  addPlayer(id) {
    if (this.players.length >= MAX_PLAYERS)
      return { success: false, message: 'Max players reached' };

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
    return this.players.find((p) => p.id === id);
  }

  /** --- Phase management --- */
  getCurrentPhase() {
    const index = this.phaseIndex;
    if (typeof index !== 'number' || index < 0 || index >= PHASES.length) {
      logger.log(
        `Invalid phaseIndex: ${index}, resetting`,
        'error',
        'Game.getCurrentPhase'
      );
      return { name: null, validActions: [], validHostActions: [] };
    }
    return PHASES[index];
  }

  nextPhase() {
    this.phaseIndex = (this.phaseIndex + 1) % PHASES.length;
    if (this.getCurrentPhase().name === 'day') this.dayCount++;
    // Reset per-phase usage
    this.players.forEach((p) => {
      p.actionUsage = {};
      p.interruptUsedMap = {};
    });

    return {
      success: true,
      message: `Phase advanced to ${this.getCurrentPhase().name}`,
    };
  }

  start() {
    if (this.gameStarted)
      return { success: false, message: 'Game already started' };
    if (this.players.length < 4)
      return { success: false, message: 'Not enough players' };

    this.gameStarted = true;
    this.dayCount = 1;
    this.phaseIndex = 0; // start at day
    this.assignPlayers();

    return {
      success: true,
      message: `Game started. It is now ${this.getCurrentPhase().name} ${
        this.dayCount
      }.`,
    };
  }

  assignPlayers() {
    const total = this.players.length;
    const minimum = MINIMUM_ROLES[total] || {};
    const rolesToAssign = [];

    // Fill minimum roles
    for (const [roleName, count] of Object.entries(minimum)) {
      for (let i = 0; i < count; i++) rolesToAssign.push(ROLES[roleName]);
    }

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

    this.players.forEach((player, idx) => {
      player.assignRole(rolesToAssign[idx].name);
      player.availableActions = [];
      player.actionUsage = {};
      player.interruptUsedMap = {};
    });
  }
}
