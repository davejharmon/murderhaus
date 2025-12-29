// /shared/constants/phases.js
export const PHASES = {
  day: {
    name: 'day',
    description: 'Players discuss, perform day actions, and may vote.',
    isDay: true,
    isNight: false,
  },

  night: {
    name: 'night',
    description: 'Special roles perform their night abilities.',
    isDay: false,
    isNight: true,
  },
};
