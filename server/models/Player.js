export class Player {
  constructor(id) {
    this.id = id;
    this.name = `Player ${id}`; // Default name
    this.role = null; // Use null instead of 'UNKNOWN'
    this.team = null;
    this.color = null;
    this.actions = []; // e.g., ['vote', 'murder']
    this.isAlive = true;
    this.isRevealed = false;

    this.selection = null; // Generic selection
    this.isConfirmed = false; // Has confirmed the selection
    this.activeActions = []; // Actions currently unlocked for this player
    this.activeActionTargets = {}; // { actionType: [list of valid target ids] }
  }
}
