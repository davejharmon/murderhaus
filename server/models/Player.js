export class Player {
  constructor(id) {
    this.id = id;
    this.name = `Player ${id}`;
    this.role = 'UNKNOWN';
    this.team = null;
    this.isAlive = null;
    this.isRevealed = false;
    this.vote = null;
    this.isConfirmed = false;
  }
}
