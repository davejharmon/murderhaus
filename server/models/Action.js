// Action.js
let ACTION_ID_SEQ = 1;

export class Action {
  constructor({ name, def }) {
    if (!name) throw new Error('Action requires name');
    if (!def) throw new Error('Action requires definition');

    this.id = ACTION_ID_SEQ++;
    this.name = name;
    this.def = def;

    this.state = {
      available: false,
      active: false,
      selection: null,
      confirmed: false,
      uses: { perPhase: 0, perGame: 0 },
      stepIndex: 0, // for multi-step actions
      stepData: {}, // store step-specific selections/results
      completed: false,
    };
  }
}
