// shared/items.js

export const ITEMS = {
  PHONE: {
    name: 'PHONE',
    description: 'Can pardon a condemned player',
    grants: [{ action: 'PARDON', events: ['DAY_LYNCH'] }],
  },
  PISTOL: {
    name: 'PISTOL',
    description: 'Draw and shoot',
    grants: [{ action: 'ONESHOT_DRAW', events: ['DAY_LYNCH'] }],
  },
};
