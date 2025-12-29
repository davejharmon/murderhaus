export const OUTCOMES = {
  KILL: ({ target, actor, game }) => {
    if (!target || target.isDead)
      return { success: false, message: 'Invalid target' };
    game.applyEffect({ type: 'KILL', target, actor });
    return {
      success: true,
      message: `${actor?.name || 'Someone'} killed ${target.name}.`,
    };
  },

  PROTECT: ({ target, actor, game }) => {
    if (!target || !actor)
      return { success: false, message: 'Invalid target or actor' };
    // Protection handled via resolution logic (canceling kills)
    return {
      success: true,
      message: `${actor.name} protected ${target.name}.`,
    };
  },

  PARDON: ({ target, actor, game }) => {
    if (!target || !actor)
      return { success: false, message: 'Invalid target or actor' };
    // Pardon handled via resolution logic (removing from pending kills)
    return { success: true, message: `${actor.name} pardoned ${target.name}.` };
  },

  GIVE_ITEM: ({ target, item, game }) => {
    if (!target || !item)
      return { success: false, message: 'Invalid target or item' };
    game.applyEffect({ type: 'GIVE_ITEM', target, item });
    return { success: true, message: `${target.name} received ${item}.` };
  },

  ASSIGN_ROLE: ({ target, role, game }) => {
    if (!target || !role)
      return { success: false, message: 'Invalid target or role' };
    game.applyEffect({ type: 'ASSIGN_ROLE', target, role });
    return {
      success: true,
      message: `${target.name} assigned role ${role.name}.`,
    };
  },
};
