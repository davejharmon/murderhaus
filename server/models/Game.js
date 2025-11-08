// server/models/Game.js
import {
  MAX_PLAYERS,
  PHASES,
  MINIMUM_ROLES,
  ROLES,
  DEFAULT_ROLE,
} from '../../shared/constants.js';
import { Player } from './Player.js';
import { broadcast } from '../utils/Broadcast.js';
import { logger } from '../utils/Logger.js';

export class Game {
  constructor() {
    this.players = [];
    this.phaseIndex = 0; // 0 = day, 1 = night
    this.gameStarted = false;
    this.dayCount = 0;
  }

  /** Add a new player */
  addPlayer(id) {
    if (this.players.length >= MAX_PLAYERS) {
      logger.log(`Failed to add player ${id}: max players reached`, 'system');
      return null;
    }
    const player = new Player(id);
    this.players.push(player);
    player.update({
      phaseName: this.getCurrentPhase().name,
      gameStarted: this.gameStarted,
    });

    logger.log(`Player ${id} connected`, 'system');
    this.broadcastState();
    return player;
  }

  /** Remove player (kick) */
  removePlayer(id) {
    const index = this.players.findIndex((p) => p.id === id);
    if (index !== -1) {
      this.players.splice(index, 1);
      logger.log(`Player ${id} was removed (kick)`, 'host');
      this.broadcastState();
    }
  }

  getPlayer(id) {
    return this.players.find((p) => p.id === id);
  }

  getCurrentPhase() {
    return PHASES[this.phaseIndex];
  }

  start() {
    if (this.gameStarted) return;
    this.gameStarted = true;
    this.dayCount = 1;
    logger.log(`Game started`, 'system');
    this.assignPlayers();
    this.updateAllPlayers();
  }

  assignPlayers() {
    const total = this.players.length;
    if (total < 1) return;

    // Determine the minimum roles required for this player count
    const minimum = MINIMUM_ROLES[total] || {};

    // Build a list of roles to assign
    const rolesToAssign = [];

    // Add required roles first
    Object.entries(minimum).forEach(([roleName, count]) => {
      for (let i = 0; i < count; i++) {
        rolesToAssign.push(ROLES[roleName]);
      }
    });

    // Fill all remaining slots with Villagers
    while (rolesToAssign.length < total) {
      rolesToAssign.push(ROLES[DEFAULT_ROLE]);
    }

    // Shuffle roles
    for (let i = rolesToAssign.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [rolesToAssign[i], rolesToAssign[j]] = [
        rolesToAssign[j],
        rolesToAssign[i],
      ];
    }

    // Assign roles to players
    this.players.forEach((player, index) => {
      const role = rolesToAssign[index];
      logger.log(`Assigning ${role.name} to ${player.name}`);
      player.assignRole(role.name);
    });
  }

  nextPhase() {
    this.phaseIndex = (this.phaseIndex + 1) % PHASES.length;
    if (this.getCurrentPhase().name === 'day') this.dayCount++;
    logger.log(`Phase changed to ${this.getCurrentPhase().name}`, 'system');
    this.updateAllPlayers();
    this.broadcastState();
  }

  /** Update all players' states */
  updateAllPlayers() {
    const phaseName = this.getCurrentPhase().name;
    this.players.forEach((player) =>
      player.update({ phaseName, gameStarted: this.gameStarted })
    );
  }

  /** Host action (kick/kill/revive) */
  hostAction(playerId, action) {
    const player = this.getPlayer(playerId);
    if (!player) return;

    switch (action) {
      case 'kick':
        this.removePlayer(playerId);
        break;
      case 'kill':
        if (player.isAlive) {
          player.isAlive = false;
          logger.log(`Host killed player ${playerId}`, 'host');
        }
        break;
      case 'revive':
        if (!player.isAlive) {
          player.isAlive = true;
          logger.log(`Host revived player ${playerId}`, 'host');
        }
        break;
      default:
        logger.log(`Unknown host action: ${action}`, 'error');
        return;
    }

    // Update hostActions after state change
    player.update({
      phaseName: this.getCurrentPhase().name,
      gameStarted: this.gameStarted,
    });
  }

  /** Broadcast the full game state */
  broadcastState() {
    broadcast({
      type: 'GAME_STATE_UPDATE',
      payload: this.getState(),
    });
  }

  /** Return a serializable game state */
  getState() {
    return {
      dayCount: this.dayCount,
      phase: this.getCurrentPhase().name,
      gameStarted: this.gameStarted,
      players: this.players.map((p) => ({
        id: p.id,
        name: p.name,
        role: p.role?.name || null, // optional: hide role from clients if needed
        team: p.team?.name || null,
        color: p.color,
        isAlive: p.isAlive,
        actions: p.actions,
        availableActions: p.availableActions,
        hostActions: p.hostActions,
        selections: p.selections,
        confirmedSelections: p.confirmedSelections,
      })),
      log: logger.getEntries(), // optional: send log to clients if desired
    };
  }
}
