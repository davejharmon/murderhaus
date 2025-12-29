// shared/constants/actions.js
export const ACTIONS = {
  PROTECT: {
    name: 'PROTECT',
    description: 'Doctor protects a player from being killed',
    max: { perPhase: 1, perGame: Infinity },
    input: { confirmReq: true },
    autoStart: false,
    conditions: ({ actor }) => actor.isAlive,
    resolution: ({ target, actor, event }) => {
      event.addEffect({ type: 'PROTECT', target, actor });
    },
  },

  KILL: {
    name: 'KILL',
    description: 'Mafia attempts to kill a target',
    max: { perPhase: 1, perGame: Infinity },
    input: { confirmReq: true },
    autoStart: false,
    conditions: ({ actor }) => actor.isAlive,
    resolution: ({ target, actor, event }) => {
      event.addEffect({ type: 'KILL', target, actor });
    },
  },

  ONESHOT: {
    name: 'ONESHOT',
    description: 'Multi-step shooting action',
    max: { perPhase: 1, perGame: 1 },
    autoStart: true,
    steps: [
      {
        name: 'DRAW',
        input: { hotkey: ['HOTKEY_A'], confirmReq: false },
        resolution: ({ actor, stepData }) => {
          stepData.drawn = true;
          return { success: true, message: 'Pistol drawn! Select a target.' };
        },
      },
      {
        name: 'SHOOT',
        input: {
          type: 'dial',
          options: ({ game, actor }) =>
            game.getAlivePlayers().filter((p) => p.id !== actor.id),
          confirmReq: true,
        },
        resolution: ({ actor, target, stepData, game }) => {
          if (!target) return { success: false, message: 'No target selected' };
          game.applyEffect({ type: 'ONESHOT_KILL', actor, target });
          stepData.shot = target.id;
          return {
            success: true,
            message: `${actor.name} shot ${target.name}`,
          };
        },
      },
    ],
    conditions: ({ actor, game }) =>
      actor.isAlive &&
      game.isDay() &&
      actor.getActionUses('ONESHOT').perGame < 1 &&
      (actor.role?.name === 'Vigilante' || actor.hasItem('PISTOL')),
  },

  PARDON: {
    name: 'PARDON',
    description: 'Use a pardon to save a player from being killed',
    max: { perPhase: 1, perGame: Infinity },
    autoStart: true,
    input: { hotkey: ['HOTKEY_A', 'HOTKEY_B'], confirmReq: false },
    conditions: ({ actor, event }) =>
      actor.isAlive &&
      actor.hasItem('PHONE') &&
      event?.def?.name === 'DAY_LYNCH' &&
      event.currentStep?.name === 'PARDON',
    resolution: ({ actor, target, event }) => {
      if (!target) return { success: false, message: 'No target selected.' };

      event.addEffect({ type: 'PARDON', actor, target });
      return {
        success: true,
        message: `${actor.name} pardoned ${target.name}`,
      };
    },
  },
};
