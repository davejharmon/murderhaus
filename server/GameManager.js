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
    this.actions = new ActionManager(this.game);
    this.host = new HostManager(this.game);
    this.events = new EventManager(this.game);
    this.view = new ViewManager(this.game);
    this.slideManager = new SlideManager();
    this.slideManager.init(this.view);
    this.game.slideManager = this.slideManager;
    this.view.setEvents(this.events);
  }

  handleActionResult(
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
  registerPlayer(id) {
    const result = this.game.addPlayer(id);
    this.handleActionResult(result, { player: result.player });
    return result.player;
  }

  removePlayer(id) {
    const player = this.game.getPlayer(id);
    const result = this.game.removePlayer(id);
    this.handleActionResult(result, { player });
  }

  /** --- Player management --- */
  updatePlayerName(id, name) {
    const player = this.game.getPlayer(id);
    if (!player) {
      return { success: false, message: `Player ${id} not found` };
    }

    // Use new Player.set()
    const result = player.set('name', name);
    result.message = `Player ${id} name set to ${name}`;
    // Send to logger + view updates
    this.handleActionResult(result, { player });

    return result;
  }

  updatePlayerImage(id, image) {
    const player = this.game.getPlayer(id);
    if (!player) {
      return { success: false, message: `Player ${id} not found` };
    }
    // Use new Player.set()
    const result = player.set('image', image);
    result.message = `Player ${id} image set to ${image}`;
    // Send to logger + view updates
    this.handleActionResult(result, { player });

    return result;
  }

  getPlayer(id) {
    return this.game.getPlayer(id);
  }
  /** --- Game lifecycle --- */
  startGame() {
    // Start the core game state
    const result = this.game.start();

    // Ensure all host-prompt events for the first phase are ready
    this.events.buildPendingEvents();

    // Handle role assignments / initial actions etc.
    this.handleActionResult(result);
  }

  nextPhase() {
    const result = this.game.nextPhase();

    // Re-initialize pending host events for the new phase
    this.events.buildPendingEvents();
    this.handleActionResult(result);
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

    this.handleActionResult(result, { player: actor });
  }

  /** --- Host actions --- */
  hostAction(playerId, actionName) {
    const result = this.host.performHostAction(playerId, actionName);
    this.handleActionResult(result);
  }

  /** --- Events --- */
  startEvent(eventName, initiatedBy = 'host') {
    const result = this.events.startEvent(eventName, initiatedBy);
    this.handleActionResult(result);
    const playerIds = this.game.players.map((p) => p.id);
    const enemyIds = this.game.playersByRole('werewolves');

    this.slideManager.queueSlides([
      Slide.eventStart(playerIds, enemyIds, result.event),
      Slide.eventTimer(playerIds, enemyIds),
    ]);
  }

  resolveEvent(eventId) {
    const result = this.events.resolveEvent(eventId);
    if (!result.success) return console.warn(result.message);
    this.handleActionResult(result);
    this.clearEvent(eventId);
  }

  clearEvent(eventId) {
    const result = this.events.clearEvent(eventId);
    if (!result.success) return console.warn(result.message);
    this.handleActionResult(result);
  }
}

export const gameManager = new GameManager();
