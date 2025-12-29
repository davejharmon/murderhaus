// shared/items.js

export const ITEMS = {
  PHONE: {
    name: 'PHONE',
    description: 'Can pardon a condemned player',
    grants: [{ action: 'PARDON', events: ['LYNCH_PARDON_WINDOW'] }],
  },
  PISTOL: {
    name: 'PISTOL',
    description: 'Draw and shoot',
    grants: [{ action: 'ONESHOT_DRAW', events: ['DAY_LYNCH_VOTE'] }],
  },
};
