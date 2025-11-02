import {
  PHASES,
  ROLES,
  ROLE_MINIMUMS,
  ROLE_POOL,
} from '../../shared/constants.js';
import { logger } from '../utils/Logger.js';
import { Player } from './Player.js';
import { BulbManager } from './BulbManager.js';

export class GameState {
  constructor() {
    this.day = null;
    this.phase = null;
    this.players = []; // array of Player instances
  }

  // ------------------------
  // History
  // ------------------------
  get history() {
    return logger.toHistoryStrings();
  }

  // ------------------------
  // Player Management
  // ------------------------
  addPlayer(id) {
    if (this.players.find((p) => p.id === id)) return false;
    this.players.push(new Player(id));
    return true;
  }

  updatePlayerName(id, name) {
    const player = this.players.find((p) => p.id === id);
    if (!player) return false;
    player.name = name;
    return true;
  }

  setPlayerRole(playerId, roleName) {
    const player = this.players.find((p) => p.id === playerId);
    if (!player) return;

    const role = ROLES.find((r) => r.name === roleName);
    if (!role) return;

    player.role = role.name;
    player.team = role.team;
    player.color = role.color;
    player.actions = [...role.actions];
    player.isAlive = true;

    logger.log(
      `[GameState] Player ${
        player.name || player.id
      } assigned role "${roleName}"`,
      'game'
    );
  }

  killPlayer(playerId) {
    const player = this.players.find((p) => p.id === playerId);
    if (player) player.isAlive = false;
  }

  revivePlayer(playerId) {
    const player = this.players.find((p) => p.id === playerId);
    if (player) player.isAlive = true;
  }

  // ------------------------
  // Game Lifecycle
  // ------------------------
  startGame() {
    if (!this.players.length) return;
    this.day = 1;
    this.phase = PHASES[0];
    this.assignRoles();
  }

  assignRoles() {
    const unassigned = this.players.filter((p) => p.role === 'UNKNOWN');
    if (!unassigned.length) return;

    const totalPlayers = this.players.length;
    let minRoles = ROLE_MINIMUMS[totalPlayers] || [ROLE_POOL[0]];

    // Count how many of each minimum role is already assigned
    const roleCounts = {};
    this.players.forEach((p) => {
      if (p.role !== 'UNKNOWN') {
        roleCounts[p.role] = (roleCounts[p.role] || 0) + 1;
      }
    });

    // Shuffle unassigned players for random distribution
    const shuffled = [...unassigned].sort(() => Math.random() - 0.5);

    // Assign minimum roles only if not already satisfied
    minRoles.forEach((roleName) => {
      const assignedCount = roleCounts[roleName] || 0;
      const minCount = minRoles.filter((r) => r === roleName).length;

      // How many more of this role we need
      const needed = minCount - assignedCount;
      if (needed <= 0) return;

      const available = shuffled.filter((p) => !p.roleAssigned);
      for (let i = 0; i < needed && available.length; i++) {
        const idx = Math.floor(Math.random() * available.length);
        const player = available.splice(idx, 1)[0];
        this.setPlayerRole(player.id, roleName);
        player.roleAssigned = true;
        roleCounts[roleName] = (roleCounts[roleName] || 0) + 1;
      }
    });

    // Assign fallback role to remaining unassigned players
    const fallbackRole = ROLE_POOL[0];
    shuffled.forEach((player) => {
      if (!player.roleAssigned) {
        this.setPlayerRole(player.id, fallbackRole);
        player.roleAssigned = true;
      }
      delete player.roleAssigned;
    });
  }

  setPhase(newPhase) {
    if (!newPhase) {
      const idx = PHASES.indexOf(this.phase);
      newPhase =
        idx === -1 || idx === PHASES.length - 1 ? PHASES[0] : PHASES[idx + 1];

      if (idx === -1 || idx === PHASES.length - 1) {
        this.day = (this.day ?? 0) + 1;
      }
    }
    this.phase = newPhase;
  }

  // ------------------------
  // Helpers for UI / logic
  // ------------------------
  aliveByAction(action) {
    return this.players.filter((p) => p.isAlive && p.actions.includes(action));
  }

  checkMurdererWin() {
    const aliveMurderers = this.aliveByAction('murder').length;
    const aliveNormies = this.aliveByAction('vote').length - aliveMurderers;
    return aliveMurderers >= aliveNormies;
  }

  checkNormieWin() {
    const aliveMurderers = this.aliveByAction('murder').length;
    return aliveMurderers === 0;
  }

  // ------------------------
  // Serialization
  // ------------------------
  serialize() {
    const bulbManager = new BulbManager(this);
    return {
      day: this.day,
      phase: this.phase,
      players: bulbManager.applyBulbColors(this.players),
      history: logger.toHistoryStrings(),
    };
  }
}
