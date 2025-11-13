// /server/managers/EventManager.js
import { ACTIONS } from '../../shared/constants.js';
import { logger } from '../utils/Logger.js';

export class EventManager {
  constructor(game) {
    this.game = game;
    this.pendingEvents = new Set();
  }

  /** Initialize host-startable actions for this phase */
  /** Initialize host-startable actions for this phase */
  initPendingHostEvents() {
    const phase = this.game.getCurrentPhase();
    if (!phase) {
      console.log('[DEBUG] No current phase found.');
      return;
    }

    console.log(`[DEBUG] Initializing host actions for phase: ${phase.name}`);
    console.log('[DEBUG] Phase events:', phase.events);

    const startable = new Set();

    phase.events?.forEach((actionName) => {
      const actionDef = ACTIONS[actionName];

      if (!actionDef) {
        console.log(`[DEBUG] Action "${actionName}" not found in ACTIONS.`);
        return;
      }

      if (actionDef.trigger !== 'event') {
        console.log(
          `[DEBUG] Action "${actionName}" skipped: trigger="${actionDef.trigger}"`
        );
        return;
      }

      // Only include if at least one alive player has this action
      const playerHasAction = this.game.players.some(
        (p) => p.isAlive && p.actions.includes(actionName)
      );

      if (playerHasAction) {
        console.log(`[DEBUG] Action "${actionName}" added to startable.`);
        startable.add(actionName);
      } else {
        console.log(
          `[DEBUG] Action "${actionName}" skipped: no alive player has this action.`
        );
      }
    });

    this.pendingEvents = startable;
    console.log('[DEBUG] Final pendingEvents:', Array.from(this.pendingEvents));
  }

  /** Return which host actions are available this phase */
  getPendingEvents() {
    return Array.from(this.pendingEvents);
  }

  /** Start a new action event (vote, protect, investigate, etc.) */
  startAction(actionName, initiatedBy = 'host') {
    const phase = this.game.getCurrentPhase();
    const action = ACTIONS[actionName];

    if (!phase || !action) {
      logger.log(`Invalid action or phase: ${actionName}`, 'warn');
      return { success: false, message: `Invalid action or phase.` };
    }

    if (initiatedBy === 'host' && !this.pendingEvents.has(actionName)) {
      return {
        success: false,
        message: `${actionName} cannot be started now.`,
      };
    }

    // Find eligible players via Player.canPerform
    const eligible = this.game.players.filter(
      (p) => p.isAlive && p.actions.includes(actionName)
    );

    if (!eligible.length) {
      return { success: false, message: 'No eligible players.' };
    }

    // Create the event record
    const event = {
      id: `${actionName}-${Date.now()}`,
      action: actionName,
      phase: phase.name,
      type: action.returns.type,
      initiatedBy,
      eligible: eligible.map((p) => p.id),
      resolved: false,
      results: {}, // playerId -> target / response
    };

    this.game.currentEvents.push(event);
    this.pendingEvents.delete(actionName);

    // Prep player input state
    eligible.forEach((p) => {
      p.selections ??= {};
      p.confirmedSelections ??= {};
      p.selections[actionName] = null;
      p.confirmedSelections[actionName] = false;
    });

    return { success: true, message: `${actionName} started.`, event };
  }

  /** Record a player’s input during an event */
  registerResponse(playerId, actionName, response) {
    const event = this.getActiveEvent(actionName);
    if (!event) {
      return { success: false, message: `No active ${actionName} event.` };
    }

    if (!event.eligible.includes(playerId)) {
      return {
        success: false,
        message: `Player not eligible for this action.`,
      };
    }

    event.results[playerId] = response;
    return { success: true };
  }

  /** Finalize an event and mark as resolved */
  resolveEvent(actionName) {
    const event = this.getActiveEvent(actionName);
    if (!event) {
      return { success: false, message: `No active ${actionName} event.` };
    }

    event.resolved = true;
    return { success: true, message: `${actionName} resolved.`, event };
  }

  /** Return the currently active (unresolved) event for a given action */
  getActiveEvent(actionName) {
    return (
      this.game.currentEvents
        ?.slice()
        .reverse()
        .find((e) => e.action === actionName && !e.resolved) || null
    );
  }
}
