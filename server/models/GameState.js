import {
  PHASES,
  ROLES,
  ROLE_MINIMUMS,
  ROLE_POOL,
} from '../../shared/constants.js';
import { logger } from '../utils/Logger.js';
import { Player } from './Player.js';

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
    let minRoles = ROLE_MINIMUMS[totalPlayers];
    if (!minRoles || !minRoles.length) {
      console.warn(
        `[GameState] No ROLE_MINIMUMS defined for ${totalPlayers} players. Defaulting to one MURDERER`
      );
      minRoles = ['MURDERER'];
    }

    // Shuffle unassigned
    const shuffled = [...unassigned].sort(() => Math.random() - 0.5);

    // Assign minimum roles
    minRoles.forEach((roleName, i) => {
      const player = shuffled[i];
      if (!player) {
        console.error(
          `[GameState] Not enough unassigned players to satisfy ROLE_MINIMUMS`
        );
        return;
      }
      this.setPlayerRole(player.id, roleName);
    });

    // Assign remaining players from ROLE_POOL or default to NORMIE
    shuffled.slice(minRoles.length).forEach((player) => {
      const roleName =
        ROLE_POOL[Math.floor(Math.random() * ROLE_POOL.length)] || 'NORMIE';
      this.setPlayerRole(player.id, roleName);
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
    return {
      day: this.day,
      phase: this.phase,
      players: this.players.map((p) => ({ ...p })),
      history: logger.toHistoryStrings(),
    };
  }
}
