import { EVENTS } from '../../shared/constants.js';
import { Event } from '../models/Event.js';

export class EventManager {
  constructor(game) {
    this.game = game;

    // Events the host can manually start in the current phase
    this.pendingEvents = new Set();
  }

  /** -------------------------------------------------
   * Build host-startable events for the current phase
   * ------------------------------------------------*/
  buildPendingEvents() {
    const phase = this.game.getCurrentPhase();
    if (!phase) return { success: false, message: '[EVENTS] Invalid phase.' };

    this.pendingEvents = new Set(
      (phase.events || []).filter((eventName) => {
        const eventDef = EVENTS[eventName];
        if (!eventDef) return false;

        // Check if any player meets participantCondition
        return this.game.players.some(
          (p) => p.state.isAlive && eventDef.participantCondition?.(p)
        );
      })
    );

    return { success: true, message: '[EVENTS] Pending events built.' };
  }

  getPendingEvents() {
    return [...this.pendingEvents];
  }

  /** -------------------------------------------------
   * Start an event
   * ------------------------------------------------*/
  startEvent(eventName, initiatedBy = 'host') {
    const phase = this.game.getCurrentPhase();
    const eventDef = EVENTS[eventName];
    if (!phase || !eventDef) {
      return { success: false, message: '[EVENTS] Invalid event or phase.' };
    }

    if (initiatedBy === 'host' && !this.pendingEvents.has(eventName)) {
      return {
        success: false,
        message: `[EVENTS] ${eventName} cannot be started at this time.`,
      };
    }

    // Create event — participants/targets auto-computed
    const event = new Event({
      id: `${eventName}-${Date.now()}`,
      eventName,
      eventDef,
      game: this.game,
      initiatedBy,
    });

    if (!event.participants.length) {
      return { success: false, message: '[EVENTS] No eligible participants.' };
    }

    this.game.activeEvents.push(event);
    this.pendingEvents.delete(eventName);
    // Activate events for players
    event.participants.forEach((pid) => {
      const player = this.game.players.find((p) => p.id === pid);
      if (!player) return;
      player.updateKeymap(this.game.activeEvents);
    });

    return { success: true, message: `[EVENTS] ${eventName} started.`, event };
  }

  /** -------------------------------------------------
   * Resolve an event
   * ------------------------------------------------*/
  resolveEvent(eventId) {
    const event = this.getEventById(eventId);
    if (!event) {
      return { success: false, message: '[EVENTS] No such event.' };
    }

    if (event.resolved) {
      return {
        success: false,
        message: '[EVENTS] Event has already resolved.',
      };
    }

    if (!event.isFullyComplete() && !event.eventDef.input.allowNoResponse) {
      return {
        success: false,
        message: '[EVENTS] Cannot resolve — not all participants completed.',
      };
    }

    const resolutionFn = event.resolution;

    if (typeof resolutionFn === 'function') {
      const result = resolutionFn(event, this.game);
      event.resolved = true;
      return {
        success: true,
        message: result.msg,
      };
    }
    return {
      success: false,
      message: '[EVENTS] End of Resolve method, something went wrong.',
    };
  }

  /** -------------------------------------------------
   * Remove event from active list
   * ------------------------------------------------*/
  clearEvent(eventId) {
    const before = this.game.activeEvents.length;

    this.game.activeEvents = this.game.activeEvents.filter(
      (e) => e.id !== eventId
    );

    const removed = this.game.activeEvents.length < before;

    if (!removed) {
      return {
        success: false,
        message: `[EVENTS] clearEvent failed — no event with id ${eventId}`,
      };
    }

    // TODO:
    // - Players recalc keymaps after event removal

    return { success: true, message: `[EVENTS] Event cleared: ${eventId}` };
  }

  /** -------------------------------------------------
   * Helper: find event by ID
   * ------------------------------------------------*/
  getEventById(id) {
    return this.game.activeEvents.find((e) => e.id === id) || null;
  }
}
