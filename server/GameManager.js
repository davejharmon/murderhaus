// server/GameManager.js
import { Game } from './models/Game.js';
import { ActionManager } from './managers/ActionManager.js';
import { HostManager } from './managers/HostManager.js';
import { EventManager } from './managers/EventManager.js';
import { ViewManager } from './managers/ViewManager.js';
import { logger } from './utils/Logger.js';
import { ACTIONS } from '../shared/constants.js';

class GameManager {
  constructor() {
    this.game = new Game();
    this.actions = new ActionManager(this.game);
    this.host = new HostManager(this.game);
    this.events = new EventManager(this.game);
    this.view = new ViewManager(this.game);

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
  updatePlayerName(pid, name) {
    const player = this.game.getPlayer(pid);
    if (!player) {
      return { success: false, message: `Player ${pid} not found` };
    }

    // Use new Player.set()
    const result = player.set('name', name);

    // Send to logger + view updates
    this.handleActionResult(result, { player });

    return result;
  }

  /** --- Game lifecycle --- */
  startGame() {
    const result = this.game.start();

    // Initialize pending host events for the first phase
    this.events.initPendingHostEvents();

    this.handleActionResult(result);
  }

  nextPhase() {
    const result = this.game.nextPhase();

    // Re-initialize pending host events for the new phase
    this.events.initPendingHostEvents();

    this.handleActionResult(result);
  }

  endGame() {
    ///
  }

  /** --- Player actions --- */
  playerInput(actorId, key) {
    const actor = this.game.getPlayer(actorId);

    const result = actor.handleInput(key);
    this.handleActionResult(result, { player: actor });
  }

  /** --- Host actions --- */
  hostAction(pid, action) {
    const result = this.host.performHostAction(pid, action);
    this.handleActionResult(result, { player: this.game.getPlayer(pid) });
  }

  /** --- Events --- */
  startEvent(actionName, initiatedBy = 'host') {
    // Create a new event object and get its unique ID
    const result = this.events.startEvent(actionName, initiatedBy);

    // Return or broadcast the eventId so frontend can reference it
    this.handleActionResult(result);
  }

  resolveEvent(eventId) {
    const result = this.events.resolveEvent(eventId);
    if (!result.success) return console.warn(result.message);
    this.handleActionResult(result);
  }

  clearEvent(eventId) {
    const result = this.events.clearEvent(eventId);
    if (!result.success) return console.warn(result.message);
    this.handleActionResult(result);
  }
}

export const gameManager = new GameManager();
