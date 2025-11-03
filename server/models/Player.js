// in Player.js
export class Player {
  constructor(id) {
    this.id = id;
    this.name = null;
    this.role = 'UNKNOWN';
    this.team = null;
    this.color = null;
    this.actions = []; // e.g., ['vote', 'murder']
    this.isAlive = true;
    this.isRevealed = false;
    this.vote = null;
    this.isConfirmed = false;
    this.activeActions = []; // NEW: actions currently unlocked for this player
  }
}
