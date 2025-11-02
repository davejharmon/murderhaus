import { PHASES } from '@shared/constants';

export const PhaseManager = {
  getHostOptions: (phase) => {
    if (!phase) {
      // pregame options
      return [
        {
          label: 'Assign Murderer',
          action: (playerId, send) =>
            send('ASSIGN_ROLE', { playerId, role: 'MURDERER' }),
        },
        {
          label: 'Assign Normie',
          action: (playerId, send) =>
            send('ASSIGN_ROLE', { playerId, role: 'NORMIE' }),
        },
      ];
    }
    // otherwise no host options during phases
    return [];
  },
};
