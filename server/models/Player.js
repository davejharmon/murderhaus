// Player.js
import { ROLES, TEAMS, DEBUG_NAMES, ACTION_KEYS } from '../../shared/constants';

import { Action } from './Action.js';
export class Player {
  constructor(id) {
    this.id = id;
    this.name = DEBUG_NAMES[id];
    this.color = '#666';
    this.image = `player${id}.png`;
    this.role = null;
    this.team = null;
    this.isDead = false;
    this.phaseDied = undefined; // null, or last phase that player died on
    this.actions = new Map(); // key=actionName, value=Action
    this.inventory = []; // items granting actions while owned

    // Build console keys dynamically
    const keys = {};
    for (const key of ACTION_KEYS) {
      keys[key] = {
        actionName: null,
        isHighlighted: false,
        isPressed: false,
      };
    }

    this.console = {
      bindings: {}, // actionName -> key (filled by binder)
      state: {
        dial: null,
        confirmed: null,
        keys,
      },
    };

    this.views = []; // all slides available on terminal
    this.viewIndex = 0; // current slide
  }

  // -------------------------
  // Game Setup
  // -------------------------

  assignRole(roleName) {
    const role = ROLES[roleName];
    if (!role)
      return { success: false, message: `Error: ${roleName} does not exist.` };

    this.role = role;
    this.team = role.team;
    this.color = role.color ?? TEAMS[role.team]?.color ?? '#999';

    // Remove actions not in role
    for (const name of this.actions.keys())
      if (!role.actions.has(name)) this.removeAction(name);

    // Add missing role actions
    for (const name of role.actions) this.addAction(name);

    return { success: true, message: `${roleName} assigned to ${this.name} ` };
  }

  // -------------------------
  // Action Management
  // -------------------------

  addAction(actionName) {
    if (this.actions.has(actionName))
      return { success: false, message: 'Error. Action exists.' };
    const action = new Action(actionName);
    this.actions.set(actionName, action);
  }

  removeAction(actionName) {
    this.actions.delete(actionName);
  }

  hasAction(actionName) {
    return this.actions.has(actionName);
  }

  getAction(actionName) {
    return this.actions.get(actionName) ?? null;
  }

  getNightAction(actions) {
    // return the action with the highest priority
  }
  // -------------------------
  // Keybinding & Input Management
  // -------------------------

  // bind available inputs to an action that canPerform() based on priority;
  bindInputs() {}

  // reset all inputs (eg. start of phase or event)
  resetInputs() {}

  // handle input change (key press, confirm press, dial change)
  handleInput() {}

  // -------------------------
  // State Updates
  // -------------------------

  kill(context = { phaseIndex }) {
    this.isDead = true;
    this.phaseDied = phaseIndex;
  }

  rezz() {
    this.isDead = false;
    this.phaseDied = undefined;
  }

  // add an item to inventory and associate actions to actions
  addItem(itemName) {}

  // remove an item from inventory and associated actions from actions
  removeItem(itemName) {}

  // flexible setter
  set(key, value, inState = false) {
    if (inState) {
      if (!(key in this.state))
        console.warn(`[Player.set] Unknown state key: ${key}`);
      this.state[key] = value;
    } else {
      if (!(key in this)) console.warn(`[Player.set] Unknown property: ${key}`);
      this[key] = value;
    }
    return {
      success: true,
      message: `[PLAYER] ${this.name} set ${inState ? 'state.' : ''}${key}`,
    };
  }

  // -------------------------
  // Public getters
  // -------------------------

  getPublicState() {
    return {
      id: this.id,
      name: this.name,
      color: this.color,
      image: this.image,
      role: this.role?.name ?? null,
      team: this.team ?? null,
      isDead: this.isDead(),
      console: this.console,
      views: this.views,
      viewIndex: this.viewIndex,
    };
  }
}
