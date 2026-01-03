import { PHASES } from '../../shared/constants/index.js';
import { logger as Log } from '../utils/Logger.js';

export class Game {
  constructor({ phaseIndex = 0, gameStarted = false, gameOver = false } = {}) {
    // -------------------------
    // Core game state (minimal footprint)
    // -------------------------
    this.players = new Map(); // playerId → Player
    this.events = new Map(); // eventId → Event
    this.activeEvents = new Set(); // eventIds of active events
    this.phaseIndex = phaseIndex;
    this.gameStarted = gameStarted;
    this.gameOver = gameOver;
  }

  // -------------------------
  // Player getters
  // -------------------------
  getPlayerById(id) {
    return this.players.get(id) || null;
  }

  getAlivePlayers() {
    return [...this.players.values()].filter((p) => !p.isDead);
  }

  getPlayersByRole(roleName) {
    return [...this.players.values()].filter((p) => p.role?.name === roleName);
  }

  getPlayersWithItem(itemName) {
    return [...this.players.values()].filter(
      (p) => p.hasItem(itemName) && !p.isDead
    );
  }

  getAlivePlayers() {
    return this.players.filter((p) => p.isDead !== true);
  }

  // -------------------------
  // Phase helpers (derived)
  // -------------------------
  getPhase() {
    return this.gameStarted
      ? PHASES[this.phaseIndex % PHASES.length]
      : undefined;
  }

  getPhaseName() {
    return this.getPhase()?.name ?? 'No Phase';
  }
  getDayCount() {
    return this.gameStarted
      ? Math.floor(this.phaseIndex / PHASES.length)
      : undefined;
  }
  getMetaphase() {
    if (!this.gameStarted) return 'PREGAME';
    if (this.gameOver) return 'POSTGAME';
    return 'GAME';
  }
  isDay() {
    return this.getPhase()?.isDay ?? false;
  }
  isNight() {
    return this.getPhase()?.isNight ?? false;
  }

  // -------------------------
  // Public state
  // -------------------------
  getPublicState() {
    return {
      phase: this.getPhaseName(),
      metaphase: this.getMetaphase(),
      gameStarted: this.gameStarted,
      gameOver: this.gameOver,
      phaseIndex: this.phaseIndex,
      dayCount: this.getDayCount(),
      players: [...this.players.values()].map((p) => p.getPublicState()),
      activeEvents: [...this.activeEvents],
      availableEvents: [], // TODO
    };
  }
}
