// /server/models/Event.js
import { EVENTS } from '../../shared/constants';

let EVENT_ID_SEQ = 1;

export class Event {
  constructor({ name, phaseStarted, initiator = null }) {
    const def = EVENTS[name];
    if (!def) throw new Error(`Unknown event: ${name}`);

    this.id = EVENT_ID_SEQ++;
    this.name = name;
    this.def = def;
    this.phaseStarted = phaseStarted;
    this.initiator = initiator;

    this.resolved = false;
    this.createdAt = Date.now();
    this.endedAt = null;

    this.state = {
      grants: new Map(), // actorId -> Set(actionName)
      inputs: new Map(), // actionName -> Map(actorId -> selection)
      results: new Map(), // effectType -> []
    };

    // Optional: for tie-breakers
    this.validTargets = null;
  }

  // -------------------------
  // Effects
  // -------------------------
  addEffect(effect) {
    const arr = this.state.results.get(effect.type) || [];
    arr.push(effect);
    this.state.results.set(effect.type, arr);
  }

  resolveEffects(game) {
    for (const [effectType, effects] of this.state.results) {
      effects.forEach((effect) => game.applyEffect(effect));
    }
  }

  resolve(game) {
    if (this.resolved) return;

    if (this.def.resolution.collect === 'vote') {
      this.resolveVoteEvent(game);
    } else {
      this.def.resolution.apply?.({ event: this, game });
    }

    this.resolved = true;
    this.endedAt = Date.now();
  }

  // -------------------------
  // Vote / Tally helpers
  // -------------------------
  addInput(actorId, actionName, selection) {
    const actionMap = this.state.inputs.get(actionName);
    if (!actionMap) return;
    actionMap.set(actorId, selection);
  }

  tally(actionName) {
    const actionMap = this.state.inputs.get(actionName);
    if (!actionMap) return { counts: new Map(), highest: () => [] };

    const counts = new Map();
    for (const selection of actionMap.values()) {
      if (!selection) continue;
      const key = selection.id ?? selection;
      counts.set(key, (counts.get(key) || 0) + 1);
    }

    return {
      counts,
      highest: () => {
        let maxCount = 0;
        let topSelections = [];
        for (const [selection, count] of counts.entries()) {
          if (count > maxCount) {
            maxCount = count;
            topSelections = [selection];
          } else if (count === maxCount) {
            topSelections.push(selection);
          }
        }
        return topSelections; // always an array
      },
    };
  }

  // -------------------------
  // Tie / vote resolution
  // -------------------------
  resolveVoteEvent(game) {
    const actionName = 'VOTE';
    const onTie = this.def.onTie || 'AFFECT_NONE';

    let topSelections = this.tally('VOTE').highest();

    // filter validTargets if provided
    if (this.validTargets) {
      topSelections = topSelections.filter((id) =>
        this.validTargets.includes(id)
      );
    }

    if (topSelections.length === 0) return; // no votes

    switch (onTie) {
      case 'AFFECT_NONE':
        break;
      case 'AFFECT_ALL':
        topSelections.forEach((id) =>
          this.addEffect({ type: 'KILL', target: game.getPlayerById(id) })
        );
        break;
      case 'TIEBREAKER':
        const tiebreakEvent = new Event({
          name: this.name,
          phaseStarted: game.phaseIndex,
          initiator: this.initiator,
        });
        tiebreakEvent.validTargets = topSelections;
        tiebreakEvent.def = { ...this.def };
        game.startEvent(tiebreakEvent);
        break;

      default:
        console.warn('Unknown onTie:', onTie);
    }
  }

  cancelEffect(type) {
    this.state.results.set(type, []);
  }
}
