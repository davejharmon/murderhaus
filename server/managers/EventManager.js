import { ACTIONS } from '../../shared/constants.js';

export class EventManager {
  constructor(game) {
    this.game = game;
    this.pendingEvents = new Set();
  }

  /** --- Initialize host-startable events for current phase --- */
  initPendingHostEvents() {
    const phase = this.game.getCurrentPhase();
    if (!phase) return;

    this.pendingEvents = new Set(
      (phase.events || []).filter((eventName) => {
        // Look for at least one alive player who has the action, trigger='event', and uses left
        return this.game.players.some((player) => {
          if (!player.state.isAlive) return false;

          return player.state.actions.some(
            (action) =>
              action.name === eventName &&
              action.trigger === 'event' &&
              action.remainingUsesThisPhase > 0
          );
        });
      })
    );
  }

  /** --- Return array of pending host events --- */
  getPendingEvents() {
    return Array.from(this.pendingEvents);
  }

  /** --- Start an event --- */
  startEvent(actionName, initiatedBy = 'host') {
    const phase = this.game.getCurrentPhase();
    const actionDef = ACTIONS[actionName];

    if (!phase || !actionDef)
      return { success: false, message: 'Invalid action or phase.' };

    // Host can only start pending events
    if (initiatedBy === 'host' && !this.pendingEvents.has(actionName)) {
      return {
        success: false,
        message: `${actionName} cannot be started now.`,
      };
    }

    // Find eligible players BEFORE activation
    const eligiblePlayers = this.game.players.filter(
      (p) =>
        p.state.isAlive &&
        p.state.actions.some(
          (a) =>
            a.name === actionName &&
            a.trigger === 'event' &&
            a.remainingUsesThisPhase > 0
        )
    );

    if (!eligiblePlayers.length)
      return { success: false, message: 'No eligible players.' };

    // Build event object
    const event = {
      id: `${actionName}-${Date.now()}`,
      action: actionName,
      phase: phase.name,
      type: actionDef?.returns?.type ?? null,
      initiatedBy,
      eligible: eligiblePlayers.map((p) => p.id),
      resolved: false,
      results: {},
    };

    // --- Activate the action for eligible players ---
    eligiblePlayers.forEach((p) => {
      const action = p.state.actions.find((a) => a.name === actionName);
      if (action) action.active = true;

      // Ensure selection maps exist
      if (!p.state.selections) p.state.selections = {};
      if (!p.state.confirmedSelections) p.state.confirmedSelections = {};

      // Reset selection state for this action
      p.state.selections[actionName] = null;
      p.state.confirmedSelections[actionName] = false;
    });

    // Add event to game
    this.game.currentEvents.push(event);

    // Remove from pending list
    this.pendingEvents.delete(actionName);

    return { success: true, message: `${actionName} started.`, event };
  }

  /** --- Mark event as resolved --- */
  resolveEvent(eventId) {
    const event = this.getEventById(eventId);
    if (!event) return { success: false, message: 'Event not found.' };
    event.resolved = true;
    return { success: true, message: `${event.action} resolved.`, event };
  }

  /** --- Remove event from currentEvents --- */
  clearEvent(eventId) {
    const idx = this.game.currentEvents.findIndex((e) => e.id === eventId);
    if (idx === -1) return { success: false, message: 'Event not found.' };
    const [removed] = this.game.currentEvents.splice(idx, 1);
    return {
      success: true,
      message: `${removed.action} cleared.`,
      event: removed,
    };
  }

  /** --- Register a player's response to an event --- */
  registerResponse(playerId, eventId, response) {
    const event = this.getEventById(eventId);
    if (!event) return { success: false, message: 'Event not found.' };
    if (!event.eligible.includes(playerId))
      return { success: false, message: 'Player not eligible.' };

    event.results[playerId] = response;

    const player = this.game.players.find((p) => p.id === playerId);
    if (player) {
      player.state.selections[event.action] = response;
      player.state.confirmedSelections[event.action] = true;
    }

    return { success: true };
  }

  /** --- Helper: get event by id --- */
  getEventById(id) {
    return this.game.currentEvents.find((e) => e.id === id) || null;
  }
}
