import { OUTCOMES } from './outcomes.js';

export const ACTIONS = {
  PROTECT: {
    name: 'PROTECT',
    description: 'Doctor protects a player from being killed',
    max: { perPhase: 1, perGame: Infinity },
    input: { confirmReq: true },
    autoStart: false,
    conditions: ({ actor }) => actor.isAlive,
    resolution: ({ actor, target, game }) =>
      OUTCOMES.PROTECT({ actor, target, game }),
  },

  KILL: {
    name: 'KILL',
    description: 'Mafia attempts to kill a target',
    max: { perPhase: 1, perGame: Infinity },
    input: { confirmReq: true },
    autoStart: false,
    conditions: ({ actor }) => actor.isAlive,
    resolution: ({ actor, target, game }) =>
      OUTCOMES.KILL({ actor, target, game }),
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
        resolution: ({ stepData }) => {
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
          stepData.shot = target.id;
          return OUTCOMES.KILL({ actor, target, game });
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
    resolution: ({ actor, target, game }) =>
      OUTCOMES.PARDON({ actor, target, game }),
  },
};
