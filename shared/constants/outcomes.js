// shared/outcomes.js

export const OUTCOMES = {
  KILL: ({ target, game }) => {
    game.kill(target);
  },

  ASSIGN_ROLE: ({ target, game, role }) => {
    target.role = role;
  },

  GIVE_ITEM: ({ target, game, item }) => {
    target.inventory.add(item);
  },
};
