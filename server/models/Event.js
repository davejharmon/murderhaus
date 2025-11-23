// /server/models/Event.js
export class Event {
  constructor({ id, eventName, eventDef, game, initiatedBy }) {
    this.id = id ?? `${eventName}-${Math.random().toString(36).substr(2, 8)}`;
    this.eventName = eventName;
    this.eventDef = eventDef; // full event definition from EVENTS[name]
    this.resolution = eventDef.resolution;
    this.phase = game.getCurrentPhase()?.name || null;
    this.initiatedBy = initiatedBy;
    this.createdAt = Date.now();

    // Compute eligible participants based on participantCondition
    this.participants = game.players
      .filter((p) => p.state.isAlive && eventDef.participantCondition?.(p))
      .map((p) => p.id);

    // Compute eligible targets based on targetCondition
    this.targets = game.players
      .filter((p) => p.state.isAlive)
      .filter((p) => eventDef.targetCondition?.(p, null))
      .map((p) => p.id);

    this.completedBy = []; // playerIds who confirmed
    this.results = {}; // { actorId: selectedKey }
    this.resolved = false;
  }

  isParticipant(pid) {
    return this.participants.includes(pid);
  }

  markCompleted(pid) {
    if (!this.completedBy.includes(pid)) this.completedBy.push(pid);
  }

  recordResult(actorId, selection, confirmed = true, initiatedByHost = false) {
    const confirmReq = this.eventDef?.input?.confirmReq || false;
    const prevSelection = this.results[actorId];
    // Only toggle to null if NOT confirmed
    if (selection === prevSelection) {
      this.results[actorId] = null;
    } else if (selection !== 'confirm') this.results[actorId] = selection;

    const isFinal = !confirmReq | confirmed;
    if (isFinal) this.markCompleted(actorId);
  }

  isFullyComplete() {
    return this.completedBy.length >= this.participants.length;
  }

  getFrontrunners() {
    const values = Object.values(this.results);

    if (values.length === 0) return [];

    // Count frequency of each vote count
    const freq = values.reduce((acc, v) => {
      acc[v] = (acc[v] || 0) + 1;
      return acc;
    }, {});

    // Find max frequency
    const maxFreq = Math.max(...Object.values(freq));

    // Return all vote-count values with max frequency
    return Object.keys(freq)
      .filter((k) => freq[k] === maxFreq)
      .map(Number)
      .sort((a, b) => a - b);
  }

  tiebreakVoting(frontrunnerIds) {
    if (!Array.isArray(frontrunnerIds) || frontrunnerIds.length === 0) {
      throw new Error(
        'tiebreakVoting requires a non-empty array of frontrunner IDs'
      );
    }

    // Restrict targets to only frontrunners
    this.targets = frontrunnerIds;

    // Reset results so the vote starts fresh
    this.results = {};

    // Reset completed participants
    this.completedBy = [];

    // Mark event as unresolved for new round
    this.resolved = false;

    // Update createdAt to current time
    this.createdAt = Date.now();
    if (this.game?.slideManager) {
      this.game.slideManager.push(Slide.eventTimer(this.game.players), true);
    }
  }

  getVoterIds(value) {
    const confirmReq = this.eventDef?.input?.confirmReq || false;
    return Object.entries(this.results)
      .filter(
        ([actorId, selectedValue]) =>
          selectedValue === value &&
          (!confirmReq || this.completedBy.includes(Number(actorId)))
      )
      .map(([actorId]) => Number(actorId));
  }

  getPublicState() {
    return {
      id: this.id,
      eventName: this.eventName,
      participants: this.participants,
      targets: this.targets,
      phase: this.phase,
      initiatedBy: this.initiatedBy,
      createdAt: this.createdAt,
      resolved: this.resolved,
      results: this.results,
      completedBy: this.completedBy,
    };
  }
}
