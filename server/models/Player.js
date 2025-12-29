// Player.js
import {
  DEBUG_NAMES,
  ACTION_KEYS,
  DIAL,
  CONFIRM,
  ACTIONS,
} from '../../shared/constants';
import { Action } from './Action.js';

export class Player {
  constructor({
    id,
    name = DEBUG_NAMES[id],
    color = '#666',
    image = `player${id}.png`,
    role = undefined,
    team = undefined,
    isDead = false,
    phaseDied = undefined,
  }) {
    if (id == null) throw new Error('Player requires id');

    this.id = id;
    this.name = name ?? `Player ${id}`;
    this.color = color;
    this.image = image;

    this.role = role;
    this.team = team;
    this.isDead = isDead;
    this.phaseDied = phaseDied;

    this.actions = new Map(); // actionId → Action
    this.inventory = new Set();
    this.events = new Set(); // events the player is participating in

    this.console = {
      views: [],
      viewIndex: 0,
      input: {
        dial: DIAL,
        confirm: CONFIRM,
        keys: structuredClone(ACTION_KEYS),
      },
    };
  }

  /** Initialize all actions for the player */
  initActions() {
    Object.values(ACTIONS).forEach((def) => {
      if (!this.actions.has(def.name)) {
        const action = new Action({ name: def.name, def });
        this.actions.set(def.name, action);

        // AutoStart if eligible
        if (def.autoStart && def.conditions({ actor: this })) {
          action.state.available = true;
          this.bindHotkey(action);
        }
      }
    });
  }

  /** Bind a hotkey to an action if it has hotkey input */
  bindHotkey(action) {
    if (!action.def.input?.hotkey) return;

    for (const key of action.def.input.hotkey) {
      if (!this.console.input.keys[key]?.bound) {
        this.console.input.keys[key].bound = action.id;
        action.state.hotkey = key;
        break;
      }
    }
  }

  /** Get action instance by name */
  getAction(name) {
    return this.actions.get(name);
  }

  /** Get current usage for an action */
  getActionUses(name) {
    const action = this.getAction(name);
    return action?.state?.uses ?? { perPhase: 0, perGame: 0 };
  }

  /** Mark that this player has used an action (increments usage counters) */
  useAction(actionName) {
    const action = this.getAction(actionName);
    if (!action) return;

    if (!action.state.uses) action.state.uses = { perPhase: 0, perGame: 0 };
    action.state.uses.perPhase += 1;
    action.state.uses.perGame += 1;
  }

  /** Add an item to the player's inventory */
  addItem(itemName) {
    this.inventory.add(itemName);
  }

  /** Remove an item from the player's inventory */
  removeItem(itemName) {
    this.inventory.delete(itemName);
  }

  /** Check if the player has an item */
  hasItem(itemName) {
    return this.inventory.has(itemName);
  }

  /** Get all actions the player can currently take based on grants, phase, and autoStart */
  getAvailableActions(event) {
    const available = [];
    this.actions.forEach((action) => {
      const granted = event?.state.grants.get(this.id)?.has(action.def.name);
      const usable =
        granted &&
        (!action.def.conditions ||
          action.def.conditions({ actor: this, game: event?.game, event }));
      if (usable) available.push(action);
    });
    return available;
  }

  addEvent(event) {
    this.events.add(event.id);
  }

  removeEvent(event) {
    this.events.delete(event.id);
  }
}
