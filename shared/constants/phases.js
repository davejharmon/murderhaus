// /shared/constants/phases.js
export const PHASES = {
  DAY: 'day',
  NIGHT: 'night',
};

export const PHASE_DEFS = {
  [PHASES.DAY]: {
    description: 'Players discuss and vote on whom to lynch.',
    hostActions: ['kill', 'rez', 'kick'],
    events: ['vote_execute', 'vote_assign', 'vote_give'],
  },
  [PHASES.NIGHT]: {
    description: 'Special roles perform their night abilities.',
    hostActions: ['kill', 'rez'],
    events: ['night_actions'],
  },
};
