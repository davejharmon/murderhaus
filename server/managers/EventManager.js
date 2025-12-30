import { EVENTS, OUTCOMES, CHANNELS } from '../../shared/constants/index.js';
import { logger as Log } from '../utils/Logger.js';

export class EventManager {
  constructor(gameManager) {
    this.gameManager = gameManager;
  }

  startEvent(eventName, initiatedBy = 'host') {
    const eventDef = EVENTS[eventName];
    if (!eventDef) {
      Log.warn(`Unknown event: ${eventName}`);
      return null;
    }

    const event = {
      id: `${eventName}-${Date.now()}`,
      def: eventDef,
      state: {
        grants: new Map(),
        inputs: new Map(),
        results: new Map(),
        pendingKills: [],
      },
      resolved: false,
    };

    this.gameManager.game.startEvent(event);
    Log.system(`Event started: ${eventName}`, { event, initiatedBy });
    this.gameManager.update();
    return event;
  }

  resolveEvent(eventId) {
    const event = this.gameManager.game.getEventById(eventId);
    if (!event) return;

    if (event.def.resolution?.apply) {
      event.def.resolution.apply({
        event,
        game: this.gameManager.game,
        outcome: ({ actionName, actor, target, item, role, callback }) => {
          const result = OUTCOMES[actionName]?.({
            actor,
            target,
            game: this.gameManager.game,
            item,
            role,
            callback,
          });
          if (result?.message) Log.info(result.message, { actor, target });
          this.gameManager.update();
          return result;
        },
      });
    }

    event.resolved = true;
    this.gameManager.game.endEvent(event, false);
    Log.system(`Event resolved: ${event.def.name}`, { event });
    this.gameManager.update();
  }

  startAllEvents() {
    const activeEvents = [...this.gameManager.game.events.values()];
    for (const event of activeEvents) {
      if (!event.resolved) this.startEvent(event.def.name, 'system');
    }
    Log.system('All events started');
    this.gameManager.update();
  }

  resolveAllEvents() {
    const activeEvents = this.gameManager.game.getActiveEvents();
    for (const event of activeEvents) this.resolveEvent(event.id);
    Log.system('All events resolved');
    this.gameManager.update();
  }

  clearEvent(eventId) {
    const event = this.gameManager.game.getEventById(eventId);
    if (!event) return;
    this.gameManager.game.endEvent(event);
    Log.system(`Event cleared: ${event.def.name}`, { event });
    this.gameManager.update();
  }
}
