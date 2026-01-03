// Player.js
import {
  DEBUG_NAMES,
  ACTION_KEYS,
  DIAL,
  CONFIRM,
  ACTIONS,
  ROLES,
  HOST_CONTROLS,
} from '../../shared/constants/index.js';
import { logger } from '../utils/Logger.js';
import { Action } from './Action.js';

export class Player {
  constructor({
    id,
    name = DEBUG_NAMES[id - 1],
    color = '#666',
    image = `player${id}.png`,
    role = undefined,
    team = undefined,
    isDead = false,
    phaseDied = undefined,
    hostControls = [],
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
    this.hostControls = hostControls;
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

  updateHostControls() {
    this.hostControls = Object.values(HOST_CONTROLS)
      .filter((control) => control.type === 'player')
      .filter((control) => {
        try {
          return control.condition(this);
        } catch (err) {
          // Defensive: bad control should not crash the game
          return { success: false, message: 'Condition badly phrased' };
        }
      })
      .map((control) => control.id);
  }

  kill(phaseIndex, initiatedBy = 'host') {
    this.isDead = true;
    this.phaseDied = phaseIndex;
    logger.log(`🔪${this.name} has been killed by ${initiatedBy}`);
  }

  rezz(initiatedBy = 'host') {
    this.isDead = false;
    this.phaseDied = null;
    logger.log(`🪦${this.name} has been rezzed by ${initiatedBy}`);
  }

  assignRole(roleName) {
    console.log('roleName', roleName);
    const role = ROLES[roleName];
    this.role = role.name;
    this.team = role.team;
    this.color = role.color;
    logger.log(`⛑️${this.name} has been asssigned the role ${roleName}`);
  }

  // OLD LOGIC

  /** Get action instance by name */
  getAction(name) {
    return this.actions.get(name);
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

  addAction(grants) {
    grants.forEach((action) => {
      // if action isn't already present in actions
      const newAction = new Action(action, ACTIONS[action]);
      this.actions.add(newAction);
    });
  }

  addEvent(event) {
    this.events.add(event.id);
  }

  removeEvent(event) {
    this.events.delete(event.id);
  }

  /** Returns a sanitized object suitable for clients */
  getPublicState() {
    return {
      id: this.id,
      name: this.name,
      color: this.color,
      image: this.image,
      role: this.role,
      team: this.team,
      isDead: this.isDead,
      phaseDied: this.phaseDied,
      availableActions:
        this.getAvailableActions()?.map((a) => a.def.name) ?? [],
      hostControls: this.hostControls ?? [],
      inventory: this.inventory,
    };
  }
}
