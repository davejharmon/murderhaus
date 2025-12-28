// Action.js
import { ACTIONS } from '../../shared/constants.js';

export class Action {
  constructor(name) {
    const actionDef = ACTIONS[name];
    if (!actionDef)
      throw new Error(`Action "${name}" is not defined in ACTIONS`);

    this.name = name;
    this.def = actionDef;
    this.state = {
      available: false,
      active: false,
      selection: null,
      confirmed: false,
      uses: {
        perPhase: 0,
        perGame: 0,
      },
    };
  }

  setSelection(selection) {
    // TODO: if player doesn't exist, throw error.
    this.state.selection = selection;
  }

  canPerform(context = {}) {
    const { input, max, conditions } = this.def;
    // Check conditions
    if (input.allowed && !input.allowed.includes(this.state.selection))
      return { success: false, message: 'Invalid selection.' };
    if (input.confirmReq && !this.state.confirmed)
      return { success: false, message: 'Not confirmed.' };
    if (conditions && !conditions(this, context))
      return { success: false, message: 'Conditions failed.' };
    if (this.state.uses.perPhase >= max.perPhase)
      return { success: false, message: 'No uses left this phase.' };
    if (this.state.uses.perGame >= max.perGame)
      return { success: false, message: 'No uses left.' };

    return { success: true };
  }

  resetForPhase() {
    this.state.confirmed = false;
    this.state.selection = null;
    this.state.uses.perPhase = 0;
  }
}
