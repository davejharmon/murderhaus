// import { EVENTS } from '../../shared/constants.js';
// import { Event } from '../models/Event.js';

// export class EventManager {
//   constructor(game) {
//     this.game = game;

//     // Events the host can manually start in the current phase
//     this.pendingEvents = new Set();
//   }

//   /** -------------------------------------------------
//    * Build host-startable events for the current phase
//    * ------------------------------------------------*/
//   buildPendingEvents() {
//     const phase = this.game.getCurrentPhase();
//     if (!phase) return { success: false, message: '[EVENTS] Invalid phase.' };

//     this.pendingEvents = new Set(
//       (phase.events || []).filter((eventName) => {
//         const eventDef = EVENTS[eventName];
//         if (!eventDef) return false;

//         // Check if any player meets participantCondition
//         return this.game.players.some(
//           (p) => p.state.isAlive && eventDef.participantCondition?.(p)
//         );
//       })
//     );

//     return { success: true, message: '[EVENTS] Pending events built.' };
//   }

//   /** -------------------------------------------------
//    * Start an event
//    * ------------------------------------------------*/
//   startEvent(eventName, initiator = 'host') {
//     const phaseIndex = this.game.phaseIndex();
//     const eventDef = EVENTS[eventName];
//     if (!phaseIndex || !eventDef) {
//       return {
//         success: false,
//         message: '[EVENTS] Invalid event or phase index.',
//       };
//     }

//     // Build participants
//     const participants = this.game.players
//       .filter((p) => eventDef.condition({ player, initiator }))
//       .map((p) => p.id);

//     participants.forEach((p) => {}); // TODO: FINISH ME

//     // Create event — participants/targets auto-computed
//     const event = new Event({
//       eventName,
//       phaseIndex: this.game.phaseIndex,
//       initiatedBy,
//     });

//     if (!event.participants.length) {
//       return { success: false, message: '[EVENTS] No eligible participants.' };
//     }

//     this.game.activeEvents.push(event);
//     this.pendingEvents.delete(eventName);
//     // Activate events for players
//     event.participants.forEach((pid) => {
//       const player = this.game.getPlayerById(pid);
//       if (!player) return;
//       player.updateKeymap(this.game.activeEvents);
//     });

//     return { success: true, message: `${event.id} started.`, event };
//   }

//   /** -------------------------------------------------
//    * Resolve an event
//    * ------------------------------------------------*/
//   resolveEvent(eventId) {
//     const event = this.getEventById(eventId);
//     if (!event) {
//       return {
//         success: false,
//         message: `Event No such event: '${event.eventName}'.`,
//       };
//     }

//     if (event.resolved) {
//       return {
//         success: false,
//         message: `Event '${event.eventName}' already resolved.`,
//       };
//     }

//     if (!event.isFullyComplete() && !event.eventDef.input.allowNoResponse) {
//       return {
//         success: false,
//         message: `Event '${event.eventName}' cannot resolve — not all participants completed.`,
//       };
//     }

//     const resolutionFn = event.resolution;

//     if (typeof resolutionFn === 'function') {
//       const result = resolutionFn(event, this.game);
//       if (result.success === true) event.resolved = true;
//       return result;
//     }
//     return {
//       success: false,
//       message: 'Event resolution not a function.',
//     };
//   }

//   /** -------------------------------------------------
//    * Remove event from active list
//    * ------------------------------------------------*/
//   clearEvent(eventId) {
//     const before = this.game.activeEvents.length;

//     this.game.activeEvents = this.game.activeEvents.filter(
//       (e) => e.id !== eventId
//     );

//     const removed = this.game.activeEvents.length < before;

//     if (!removed) {
//       return {
//         success: false,
//         message: `[EVENTS] clearEvent failed — no event with id ${eventId}`,
//       };
//     }

//     // TODO:
//     // - Players recalc keymaps after event removal

//     return { success: true, message: `${eventId} is over.` };
//   }

//   /** -------------------------------------------------
//    * Helper: find event by ID
//    * ------------------------------------------------*/
//   getEventById(id) {
//     return this.game.activeEvents.find((e) => e.id === id) || null;
//   }

//   getEventByName(name) {
//     return this.game.activeEvents.find((e) => e.eventName === name) || null;
//   }

//   /** -------------------------------------------------
//    * Helper: get names of pending events
//    * ------------------------------------------------*/
//   // getPendingEventNames() {
//   //   return [...this.pendingEvents];
//   // }

//   /** -------------------------------------------------
//    * Helper: get all active events
//    * ------------------------------------------------*/
//   getActiveEvents() {
//     return this.game.activeEvents;
//   }

//   getPendingEvents() {
//     return [...this.pendingEvents];
//   }
// }
