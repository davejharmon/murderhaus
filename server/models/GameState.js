import {
  PHASE_NAMES,
  ROLES,
  ROLE_MINIMUMS,
  ROLE_POOL,
  PHASE_ACTIONS,
} from '../../shared/constants.js';
import { logger } from '../utils/Logger.js';
import { Player } from './Player.js';
import { BulbManager } from './BulbManager.js';

export class GameState {
  constructor() {
    this.day = null;
    this.phase = null;
    this.players = []; // array of Player instances
    this.recentlyKilled = new Set();
    this.recentlyVoted = new Set();
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
      `${player.name ?? `Player ${player.id}`} assigned role "${roleName}"`,
      'game'
    );
  }

  // ------------------------
  // Kill / Revive
  // ------------------------
  killPlayer(playerId) {
    const player = this.players.find((p) => p.id === playerId);
    if (!player) return;

    player.isAlive = false;
    this.recentlyKilled.add(playerId);

    // Clear the killed player's own selection and actions
    player.selection = null;
    player.isConfirmed = false;
    player.activeActions = [];
    player.activeActionTargets = {};

    // Remove killed player from targets of others
    this.players.forEach((p) => {
      if (!p.isAlive) return;

      Object.entries(p.activeActionTargets || {}).forEach(
        ([actionType, targets]) => {
          // Remove killed player from valid targets
          p.activeActionTargets[actionType] = targets.filter(
            (id) => id !== playerId
          );

          // If the killed player was selected, clear selection
          if (p.selection === playerId) {
            p.selection = null;
            p.isConfirmed = false;
            logger.log(
              `${p.name ?? `Player ${p.id}`} deselected ${
                player.name ?? `Player ${player.id}`
              }`,
              'game'
            );
          }
        }
      );
    });

    logger.log(`${player.name ?? `Player ${player.id}`} was killed`, 'game');
  }

  revivePlayer(playerId) {
    const player = this.players.find((p) => p.id === playerId);
    if (!player) return;

    player.isAlive = true;
    this.recentlyKilled.delete(playerId);

    // Reset selection and confirmation
    player.selection = null;
    player.isConfirmed = false;
    player.activeActions = [];
    player.activeActionTargets = {};

    // Restore actions allowed in the current phase
    const alivePlayers = this.players.filter((p) => p.isAlive);
    player.actions?.forEach((actionType) => {
      if (!PHASE_ACTIONS[this.phase]?.includes(actionType)) return;

      player.activeActions.push(actionType);
      player.activeActionTargets[actionType] =
        actionType === 'vote'
          ? alivePlayers.map((p) => p.id) // vote includes self
          : alivePlayers.filter((p) => p.id !== player.id).map((p) => p.id);

      logger.log(
        `${
          player.name ?? `Player ${player.id}`
        } can perform ${actionType} again`,
        'game'
      );
    });

    // Also add revived player back as a valid target for all alive players
    this.players.forEach((p) => {
      if (!p.isAlive || !p.activeActionTargets) return;

      Object.entries(p.activeActionTargets).forEach(([actionType, targets]) => {
        if (!targets.includes(player.id)) {
          // For vote, include self if applicable
          if (actionType === 'vote' || actionType !== 'vote')
            targets.push(player.id);
        }
      });
    });

    logger.log(`${player.name ?? `Player ${player.id}`} was revived`, 'game');
  }

  // ------------------------
  // Game Lifecycle
  // ------------------------
  startGame() {
    if (!this.players.length) return;
    this.day = 1;
    this.phase = PHASE_NAMES[0];
    this.assignRoles();
    logger.log(`Game started (Day ${this.day}, Phase: ${this.phase})`, 'game');
  }

  assignRoles() {
    logger.log('Assigning roles...', 'game');
    const unassigned = this.players.filter((p) => p.role === null);
    if (!unassigned.length) return;

    const totalPlayers = this.players.length;
    const minRoles = ROLE_MINIMUMS[totalPlayers] || [ROLE_POOL[0]];
    const roleCounts = {};

    this.players.forEach((p) => {
      if (p.role !== null) roleCounts[p.role] = (roleCounts[p.role] || 0) + 1;
    });

    const shuffled = [...unassigned].sort(() => Math.random() - 0.5);

    // Assign minimum roles
    minRoles.forEach((roleName) => {
      const assignedCount = roleCounts[roleName] || 0;
      const minCount = minRoles.filter((r) => r === roleName).length;
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

    // Fallback roles
    const fallbackRole = ROLE_POOL[0];
    shuffled.forEach((player) => {
      if (!player.roleAssigned) this.setPlayerRole(player.id, fallbackRole);
      delete player.roleAssigned;
    });
  }

  setPhase(newPhase) {
    if (!newPhase) {
      const idx = PHASE_NAMES.indexOf(this.phase);
      newPhase =
        idx === -1 || idx === PHASE_NAMES.length - 1
          ? PHASE_NAMES[0]
          : PHASE_NAMES[idx + 1];
      if (idx === -1 || idx === PHASE_NAMES.length - 1)
        this.day = (this.day ?? 0) + 1;
    }

    this.phase = newPhase;
    this.recentlyKilled.clear();
    this.recentlyVoted.clear();

    // Clear all active actions
    this.players.forEach((p) => (p.activeActions = []));

    // Restore actions per PHASE_ACTIONS
    Object.values(this.players).forEach((player) => {
      if (!player.isAlive) return;
      const alivePlayers = this.players.filter((p) => p.isAlive);

      player.actions?.forEach((actionType) => {
        if (!PHASE_ACTIONS[newPhase]?.includes(actionType)) return;

        player.activeActions.push(actionType);
        player.activeActionTargets[actionType] =
          actionType === 'vote'
            ? alivePlayers.map((p) => p.id)
            : alivePlayers.filter((p) => p.id !== player.id).map((p) => p.id);

        player.selection = null;
        player.isConfirmed = false;
      });
    });

    logger.log(`Phase updated to: ${this.phase}`, 'game');
  }

  // ------------------------
  // Generic Action Handling
  // ------------------------
  _startActionPhase(actionType) {
    const alivePlayers = this.players.filter((p) => p.isAlive);

    this.players.forEach((player) => {
      if (player.isAlive && player.actions.includes(actionType)) {
        player.activeActions.push(actionType);
        player.selection = null;
        player.isConfirmed = false;

        player.activeActionTargets[actionType] =
          actionType === 'vote'
            ? alivePlayers.map((p) => p.id)
            : alivePlayers.filter((p) => p.id !== player.id).map((p) => p.id);
      }
    });

    logger.log(`${actionType} phase started`, 'game');
  }

  doAction(playerId, actionType, targetId) {
    const player = this.players.find((p) => p.id === playerId);
    if (
      !player ||
      !player.isAlive ||
      !player.activeActions.includes(actionType)
    )
      return false;

    // Allow deselection (targetId === null)
    if (targetId !== null) {
      if (
        !player.activeActionTargets ||
        !player.activeActionTargets[actionType] ||
        !player.activeActionTargets[actionType].includes(targetId)
      )
        return false;
    }

    player.selection = targetId; // can be null
    player.isConfirmed = false;

    logger.log(
      targetId === null
        ? `${player.name ?? `Player ${player.id}`} deselected ${actionType}`
        : `${
            player.name ?? `Player ${player.id}`
          } selected ${targetId} for ${actionType}`,
      'game'
    );

    return true;
  }

  confirmAction(playerId, actionType) {
    const player = this.players.find((p) => p.id === playerId);
    if (
      !player ||
      !player.isAlive ||
      !player.activeActions.includes(actionType)
    )
      return false;

    player.isConfirmed = true;

    const idx = player.activeActions.indexOf(actionType);
    if (idx !== -1) player.activeActions.splice(idx, 1);

    logger.log(
      `${player.name ?? `Player ${player.id}`} confirmed ${actionType} (${
        player.selection
      })`,
      'game'
    );
    return true;
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
