import { ROLES, ACTIONS } from '../../shared/constants.js';
import { ActionManager } from './ActionManager.js';

export class Player {
  constructor(id, roleName = 'NORMIE', gameState = null) {
    this.id = id;
    this.name = `Player ${id}`;
    this.role = null;
    this.team = null;
    this.color = null;
    this.isAlive = true;

    // Each action holds: selection, validTargets, quantity, isConfirmed
    this.actions = {};
    this.hostActions = [];

    // Assign role and initialize actions
    this.assignRole(roleName, gameState);
  }

  assignRole(roleName, gameState = null) {
    const role = ROLES.find((r) => r.name === roleName);
    if (!role) throw new Error(`Unknown role: ${roleName}`);

    this.role = role.name;
    this.team = role.team;
    this.color = role.color;

    // Clear and assign actions
    this.actions = {};
    for (const actionName of role.actions) {
      this.addAction(actionName, gameState);
    }
  }

  addAction(actionName, gameState = null, quantity = null) {
    if (this.actions[actionName]) return; // already exists

    const actionDef = ACTIONS[actionName];
    if (!actionDef) throw new Error(`Unknown action: ${actionName}`);

    const validTargets =
      gameState && actionDef.getValidTargets
        ? actionDef.getValidTargets(gameState, this)
        : [];

    this.actions[actionName] = {
      selection: null,
      validTargets,
      isConfirmed: false,
      quantity: quantity ?? actionDef.defaultQuantity,
    };
  }

  removeAction(actionName) {
    delete this.actions[actionName];
  }

  setSelection(actionName, targetId) {
    const action = this.actions[actionName];
    if (!action || action.isConfirmed || action.quantity <= 0) return;
    if (!action.validTargets.includes(targetId)) return;

    action.selection = targetId;
  }

  confirmAction(actionName) {
    const action = this.actions[actionName];
    if (!action || action.quantity <= 0 || action.selection == null) return;

    action.isConfirmed = true;
  }

  resetAction(actionName) {
    const action = this.actions[actionName];
    if (!action) return;

    action.selection = null;
    action.isConfirmed = false;
  }

  canUseAction(actionName) {
    const action = this.actions[actionName];
    return action && action.quantity > 0;
  }

  isActionConfirmed(actionName) {
    return this.actions[actionName]?.isConfirmed ?? false;
  }
}
