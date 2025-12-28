// server/GameManager.js
import { Game } from './models/Game.js';
import { ActionManager } from './managers/ActionManager.js';
import { HostManager } from './managers/HostManager.js';
import { EventManager } from './managers/EventManager.js';
import { ViewManager } from './managers/ViewManager.js';
import { SlideManager } from './managers/SlideManager.js';
import { logger } from './utils/Logger.js';
import { Slide } from './models/Slide.js';

class GameManager {
  constructor() {
    this.game = new Game();
    this.host = new HostManager(this.game);
    this.events = new EventManager(this.game);
    this.view = new ViewManager(this.game);
    this.slideManager = new SlideManager();
    this.slideManager.init(this.view);
    this.game.slideManager = this.slideManager;
    this.view.setEvents(this.events);
  }

  logResult(
    result,
    { player = null, type = 'system', updateView = true } = {}
  ) {
    if (result.message)
      logger.log(result.message, result.success === false ? 'warn' : type);

    if (updateView) {
      this.view.publishLog();
      this.view.updatePlayerViews(); // includes publishGameMeta and publishAllPlayers
      this.view.publishGameMeta(); // ensure meta is always fresh
    }

    if (player) this.view.publishPlayer(player);
  }

  /** --- Game lifecycle --- */
  registerPlayer(playerId) {
    const result = this.game.addPlayer(playerId);
    this.logResult(result, { player: result.player });
    return result.player;
  }

  removePlayer(playerId) {
    const player = this.game.getPlayer(playerId);
    const result = this.game.removePlayer(playerId);
    this.logResult(result, { player });
  }

  /** --- Player management --- */
  updatePlayerName(playerId, name) {
    const player = this.game.getPlayer(playerId);
    if (!player)
      return { success: false, message: `Player ${playerId} not found` };
    const result = player.set('name', name);
    result.message = `Player ${playerId} name set to ${name}`;
    this.logResult(result, { player });
    return result;
  }

  updatePlayerImage(playerId, image) {
    const player = this.game.getPlayer(playerId);
    if (!player)
      return { success: false, message: `Player ${playerId} not found` };
    const result = player.set('image', image);
    result.message = `Player ${playerId} image set to ${image}`;
    this.logResult(result, { player });
    return result;
  }

  getPlayer(playerId) {
    return this.game.getPlayer(playerId);
  }
  /** --- Game lifecycle --- */
  startGame() {
    const result = this.game.start();

    // Ensure all host-prompt events for the first phase are ready
    this.events.buildPendingEvents();
    this.logResult(result);
  }

  nextPhase() {
    const result = this.game.nextPhase();

    // Re-initialize pending host events for the new phase
    this.events.buildPendingEvents();
    this.logResult(result);
    this.slideManager.clear();
  }

  endGame() {
    ///
  }

  /** --- Player actions --- */
  playerInput(actorId, key) {
    const actor = this.game.getPlayer(actorId);

    // Look up the event associated with this key
    const keyEntry = actor.state.keymap[key];
    let event = null;
    if (keyEntry?.eventId) {
      event = this.events.getEventById(keyEntry.eventId);
    }

    const result = actor.handleInput(key, event);
    if (event) actor.updateKeymap(this.game.activeEvents);

    this.logResult(result, { player: actor });
  }

  /** --- Host actions --- */
  hostAction(playerId, actionName) {
    const result = this.host.performHostAction(playerId, actionName);
    this.logResult(result);
  }

  /** --- Events --- */
  startEvent(eventName, initiatedBy = 'host') {
    const result = this.events.startEvent(eventName, initiatedBy);
    this.logResult(result);
  }

  resolveEvent(eventId) {
    const result = this.events.resolveEvent(eventId);
    this.logResult(result);
    if (result.success === true) {
      this.clearEvent(eventId);
    } // if false, for now assume its a tie.
    const activeEvents = this.events.getActiveEvents();
    const playerIds = this.game.players.map((p) => p.id);
    const enemyIds = this.game.playerIDsByTeam('werewolves');
    const timer = 30;
    this.slideManager.queueSlides([
      Slide.eventStart(playerIds, enemyIds, activeEvents),
      Slide.eventTimer(playerIds, enemyIds, timer),
    ]);
  }

  clearEvent(eventId) {
    const result = this.events.clearEvent(eventId);
    if (!result.success) return console.warn(result.message);
    this.logResult(result);
  }

  startAllEvents(initiatedBy = 'host') {
    const pendingEvents = this.events.getPendingEvents();
    if (!pendingEvents.length) return;

    pendingEvents.forEach((e) => {
      this.startEvent(e, initiatedBy);
      const activeEvents = this.events.getActiveEvents();
      const playerIds = this.game.players.map((p) => p.id);
      const enemyIds = this.game.playerIDsByTeam('werewolves');
      const timer = 30;
      this.slideManager.queueSlides([
        Slide.eventStart(playerIds, enemyIds, activeEvents),
        Slide.eventTimer(playerIds, enemyIds, timer),
      ]);
    });
  }

  resolveAllEvents() {
    const activeEvents = this.events
      .getActiveEvents()
      .filter((e) => !e.resolved);
    if (!activeEvents.length) return;

    activeEvents.forEach((e) => {
      this.resolveEvent(e.id);
    });
    this.logResult({ success: true, message: `Resolved all events.` }); // nmeed to check these are all true.
  }
}

export const gameManager = new GameManager();
