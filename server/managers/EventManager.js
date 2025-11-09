// server/managers/EventManager.js
export class EventManager {
  constructor(game) {
    this.game = game;
  }

  startSelection(actionName) {
    const phase = this.game.getCurrentPhase();
    const eligible = this.game.players.filter((p) =>
      (p.availableActions || []).some((a) => a.name === actionName)
    );

    if (!eligible.length)
      return { success: false, message: 'No eligible players' };

    eligible.forEach((p) => {
      p.selections[actionName] = null;
      p.confirmedSelections[actionName] = false;
    });

    const event = {
      type: 'selection',
      action: actionName,
      phase: phase.name,
      players: eligible.map((p) => p.id),
      resolved: false,
    };

    this.game.currentEvents.push(event);
    return { success: true, message: `${actionName} started.` };
  }

  revealSelection(actionName) {
    const event = [...this.game.currentEvents]
      .reverse()
      .find(
        (e) => e.type === 'selection' && e.action === actionName && !e.resolved
      );

    if (!event) return { success: false, message: 'No active selection event' };

    event.resolved = true;
    return { success: true, message: `${actionName} revealed.` };
  }

  resolveLastEvent() {
    if (!this.game.currentEvents.length) return null;
    const last = this.game.currentEvents.pop();
    if (last.type === 'selection') {
      last.players.forEach((id) => {
        const p = this.game.getPlayer(id);
        if (p) {
          p.selections[last.action] = null;
          p.confirmedSelections[last.action] = false;
        }
      });
    }
    return last;
  }

  getActiveEvent() {
    for (let i = this.game.currentEvents.length - 1; i >= 0; i--) {
      const e = this.game.currentEvents[i];
      if (e.type === 'selection' && !e.resolved) return e;
    }
    return null;
  }
}
