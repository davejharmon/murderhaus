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

  // -------------------------
  // Event getters
  // -------------------------
  getEventById(id) {
    return this.events.get(id) || null;
  }
  getActiveEvents() {
    return [...this.activeEvents]
      .map((id) => this.getEventById(id))
      .filter(Boolean);
  }

  getEventGrants(event) {
    const alivePlayers = this.getAlivePlayers();

    const roleGrants = alivePlayers.flatMap((player) => {
      const role = player.role;
      if (!role?.grants) return [];
      return role.grants
        .filter((g) => g.events.includes(event.name))
        .map((g) => ({ action: g.action, to: [player] }));
    });

    const itemGrants = alivePlayers.flatMap((player) =>
      [...player.inventory].flatMap((itemName) => {
        const item = ITEMS[itemName];
        if (!item?.grants) return [];
        return item.grants
          .filter((g) => g.events.includes(event.name))
          .map((g) => ({ action: g.action, to: [player] }));
      })
    );

    const explicitGrants = event.grants || [];
    return [...explicitGrants, ...roleGrants, ...itemGrants];
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
  // Player actions / effects
  // -------------------------
  kill(player) {
    if (player && !player.isDead) {
      player.isDead = true;
      player.phaseDied = this.phaseIndex;
    }
  }
  assignRole(player, role) {
    if (player) player.role = role;
  }
  giveItem(player, item) {
    if (player) player.inventory.add(item);
  }

  applyEffect(effect) {
    switch (effect.type) {
      case 'KILL':
        this.kill(effect.target);
        break;
      case 'GIVE_ITEM':
        this.giveItem(effect.target, effect.item);
        break;
      case 'ASSIGN_ROLE':
        this.assignRole(effect.target, effect.role);
        break;
      case 'PROTECT':
      case 'PARDON':
        break; // handled elsewhere
      default:
        Log.warn('Unknown effect type', effect);
    }
  }

  performActionStep(playerId, actionId, input = {}) {
    const player = this.getPlayerById(playerId);
    if (!player) return { success: false, message: 'Player not found' };

    const action = player.getActionById(actionId);
    if (!action) return { success: false, message: 'Action not found' };

    const step = action.currentStep;
    if (!step) return { success: false, message: 'No step to perform' };

    const result = step.resolution({
      game: this,
      actor: player,
      event: this.getEventById(action.eventId),
      input,
      stepData: action.state.stepData,
    });

    if (result.success) {
      action.state.stepIndex++;
      if (action.state.stepIndex >= (action.def.steps?.length ?? 0)) {
        action.state.completed = true;
        action.state.active = false;
      }
    }
    return result;
  }

  startAction(playerId, actionName, eventId = null) {
    const player = this.getPlayerById(playerId);
    if (!player) return null;

    const def = ACTIONS[actionName];
    if (!def) return null;

    const action = new Action({ name: actionName, def, eventId });
    action.state.active = def.autoStart ?? false;
    player.actions.set(action.id, action);

    if (action.isMultiStep() && !action.currentStep.input?.confirmReq) {
      this.performActionStep(playerId, action.id);
    }
    return action;
  }

  // -------------------------
  // Event lifecycle
  // -------------------------
  startEvent(event, { isInterrupt = false } = {}) {
    this.events.set(event.id, event);
    this.activeEvents.add(event.id);
    event.isInterrupt = isInterrupt;

    const grants = this.getEventGrants(event);
    grants.forEach((grant) => {
      grant.to.forEach((actor) => {
        const set = event.state.grants.get(actor.id) || new Set();
        if (grant.action) set.add(grant.action);
        event.state.grants.set(actor.id, set);

        const map = event.state.inputs.get(actor.id) || new Map();
        const targets = grant.action
          ? event.validTargets || this.getAlivePlayers()
          : [];
        targets.forEach((t) => map.set(t.id, null));
        event.state.inputs.set(actor.id, map);
      });
    });
  }

  endEvent(event, andResolve = false) {
    if (!event) return;
    if (!event.resolved && andResolve) event.resolve(this);
    this.activeEvents.delete(event.id);
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
