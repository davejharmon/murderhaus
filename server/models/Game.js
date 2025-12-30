import { PHASES } from '../../shared/constants/index.js';
import { logger as Log } from '../utils/Logger.js';

export class Game {
  constructor({
    phase = undefined,
    phaseIndex = undefined,
    gameStarted = false,
    gameOver = false,
  } = {}) {
    // -------------------------
    // Core game state
    // -------------------------
    this.players = new Map(); // playerId → Player
    this.events = new Map(); // eventId → Event
    this.activeEvents = new Set(); // eventIds of currently active events
    this.phase = phase;
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

    // Role-based grants
    const roleGrants = alivePlayers.flatMap((player) => {
      const role = player.role;
      if (!role?.grants) return [];
      return role.grants
        .filter((g) => g.events.includes(event.name))
        .map((g) => ({ action: g.action, to: [player] }));
    });

    // Item-based grants
    const itemGrants = alivePlayers.flatMap((player) => {
      return [...player.inventory].flatMap((itemName) => {
        const item = ITEMS[itemName];
        if (!item?.grants) return [];
        return item.grants
          .filter((g) => g.events.includes(event.name))
          .map((g) => ({ action: g.action, to: [player] }));
      });
    });

    // Explicit grants passed on event creation
    const explicitGrants = event.grants || [];

    return [...explicitGrants, ...roleGrants, ...itemGrants];
  }

  // -------------------------
  // Phase helpers
  // -------------------------
  isDay() {
    return this.getCurrentPhase().isDay;
  }

  isNight() {
    return this.getCurrentPhase().isNight;
  }

  // -------------------------
  // Player actions / effects
  // -------------------------
  kill(player) {
    if (!player || player.isDead) return;
    player.isDead = true;
    player.phaseDied = this.phaseIndex;
  }

  assignRole(player, role) {
    if (!player) return;
    player.role = role;
  }

  giveItem(player, item) {
    if (!player) return;
    player.inventory.add(item);
  }

  applyEffect(effect) {
    // Minimal generic setter / dispatcher
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
        // These are handled in OUTCOMES or event resolution, not directly
        break;
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

    // Provide full context to step resolution
    const result = step.resolution({
      game: this,
      actor: player,
      event: this.getEventById(action.eventId), // optional if action tied to an event
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

  /**
   * Start an action for a player
   */
  startAction(playerId, actionName, eventId = null) {
    const player = this.getPlayerById(playerId);
    if (!player) return null;

    const def = ACTIONS[actionName];
    if (!def) return null;

    const action = new Action({ name: actionName, def, eventId });

    // mark active if autoStart or event triggered
    action.state.active = def.autoStart ?? false;
    player.actions.set(action.id, action);

    // If multi-step and first step has no input requirement, perform immediately
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

        if (grant.action) {
          // limit inputs to validTargets if provided
          const targets = event.validTargets || this.getAlivePlayers();
          targets.forEach((t) => map.set(t.id, null));
        }

        event.state.inputs.set(actor.id, map);
      });
    });
  }

  endEvent(event, andResolve = false) {
    if (!event) return;

    // Resolve before removing from active events
    if (!event.resolved && andResolve) {
      event.resolve(this);
    }

    this.activeEvents.delete(event.id);
  }

  getPhase() {
    if (!this.gameStarted) return undefined;
    return PHASES[this.phaseIndex % PHASES.length];
  }

  getDay() {
    if (!this.gameStarted) return undefined;
    return Math.floor(phaseIndex / PHASES.length);
  }

  getMetaphase() {
    if (!this.gameStarted && !this.gameOver) return 'PREGAME';
    if (this.gameOver) return 'POSTGAME';
    return 'GAME';
  }
  getPublicState() {
    return {
      phase: this.getPhase?.key,
      metaphase: this.getMetaphase(),
      gameStarted: this.gameStarted,
      gameOver: this.gameOver,
      phaseIndex: this.phaseIndex,
      dayCount: this.getDay(),
      players: [...this.players.values()].map((p) => p.getPublicState()),
      activeEvents: [...this.activeEvents],
      availableEvents: [], // to do
    };
  }
}
