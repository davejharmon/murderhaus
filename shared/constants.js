// /shared/constants.js

export const MAX_PLAYERS = 9; // Max players and max selectable buttons per player

export const ALL_KEYS = [
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  'A',
  'B',
  'confirm',
];

export const PHASES = [
  {
    name: 'day',
    description: 'Players discuss and vote on whom to lynch.',
    playerActions: ['vote'],
    hostActions: ['kill', 'revive'],
    events: ['vote'], // ← restore this
  },
  {
    name: 'night',
    description: 'Special roles perform their night abilities.',
    playerActions: ['kill', 'protect', 'investigate', 'commute'],
    hostActions: ['kill', 'revive'],
    events: ['dummy', 'kill', 'investigate', 'protect'], // ← add these
  },
];

// --- Teams ---
export const TEAMS = {
  villagers: { name: 'villagers', color: '#4db8ff' },
  werewolves: { name: 'werewolves', color: '#be0000' },
};

// --- Host Actions ---
export const HOST_ACTIONS = {
  kill: {
    name: 'kill',
    label: '🗡️',
    phase: ['day', 'night'],
    pregame: false,
    conditions: ({ player }) => player?.state?.isAlive,
    result: (player) => {
      console.log;
      player.kill();
      return `Host killed ${player.name}.`;
    },
  },
  rezz: {
    name: 'rezz',
    label: '🪦',
    phase: ['day', 'night'],
    pregame: false,
    conditions: ({ player }) => !player?.state?.isAlive,
    result: (player) => {
      player.rezz();
      return `Host rezzed ${player.name}.`;
    },
  },
  kick: {
    name: 'kick',
    label: '🥾',
    phase: ['day', 'night'],
    pregame: true,
    conditions: ({ player }) => true,
    result: (player, game) => {
      game.removePlayer(player.id);
      return `Host kicked ${player.name}.`;
    },
  },
  debugVote: {
    name: 'debugVote',
    label: '🎲',
    phase: ['day'], // only during day votes
    pregame: false,

    // Only show if there is an active vote event where the player hasn't completed yet
    conditions: ({ player, game }) => {
      return game?.activeEvents?.some(
        (e) =>
          e.eventName === 'vote' &&
          !e.resolved &&
          e.participants.includes(player.id) &&
          !e.completedBy.includes(player.id)
      );
    },

    // Simulate a vote for that player
    result: (player, game) => {
      const event = game.activeEvents.find(
        (e) =>
          e.eventName === 'vote' &&
          !e.resolved &&
          e.participants.includes(player.id) &&
          !e.completedBy.includes(player.id)
      );

      if (!event) return;

      // Pick a random valid target for this player
      const targetId =
        event.targets[Math.floor(Math.random() * event.targets.length)];

      // Record the result and mark the player as completed
      event.recordResult(player.id, targetId, true);

      return `Host cast a debug vote for ${player.name} -> Player ${targetId}`;
    },
  },
};

// --- Player Actions ---
export const ACTIONS = {
  oneshot: {
    name: 'oneshot',
    input: {
      allowed: ['A', 'B'],
      confirmReq: true,
    },
    uses: 1,
    usesPerPhase: Infinity,
    conditions: ({ actor }) => actor?.state?.isAlive,
    result: (actor) => {
      actor.kill(); //
    },
  },
};

export const EVENTS = {
  vote: {
    name: 'vote',
    description: 'Choose a player to eliminate',
    phase: ['day'],
    participantCondition: (player) => player.state.isAlive,
    targetCondition: (player) => player.state.isAlive,

    input: {
      allowed: ['1', '2', '3', '4', '5', '6', '7', '8', '9'],
      confirmReq: true,
      allowNoResponse: true,
      resultType: 'majority', // or 'perPlayer'
      allowTies: true, // handles ties in resolution
    },

    resolution: (event, game) => {
      // if tie, start a tiebreaker event with just the most targeted participants, else
      game.showVoteResults(event);
    },
  },

  dummy: {
    name: 'dummy',
    description: 'A dummy event so everyone has a button to press.',
    phase: ['night'],
    participantCondition: (player) => player.state.isAlive,
    targetCondition: (player) => player.state.isAlive,

    input: {
      allowed: ['1', '2', '3', '4', '5', '6', '7', '8', '9'],
      confirmReq: true,
      allowNone: true,
      resultType: 'perPlayer',
      allowTies: false, // cannot end event while a tie is in place.
    },

    resolution: (event, game) => {
      return; // no effect, used to make sure everyone presses buttons during this phase.
    },
  },
  kill: {
    name: 'kill',
    description: 'Choose a player to murder in the night.',
    phase: ['night'],
    participantCondition: (player) => player.state.isAlive,
    targetCondition: (player, actor) =>
      player.state.isAlive && player.id !== actor.id,

    input: {
      allowed: ['1', '2', '3', '4', '5', '6', '7', '8', '9'],
      confirmReq: true,
      allowNone: false,
      resultType: 'majority',
      allowTies: false, // cannot end event while a tie is in place.
    },

    resolution: (event, game) => {
      // kill player associated with the most targeted key in results
    },
  },
  investigate: {
    name: 'investigate',
    description: 'WRITE ME.',
    phase: ['night'],
    participantCondition: (player) => player.state.isAlive,
    targetCondition: (player) => player.state.isAlive,

    input: {
      allowed: ['1', '2', '3', '4', '5', '6', '7', '8', '9'],
      confirmReq: true,
      allowNone: false,
      resultType: 'perPlayer',
      allowTies: false, // cannot end event while a tie is in place.
    },

    resolution: (event, game) => {
      // return investigate status to investigator
    },
  },
  protect: {
    name: 'protect',
    description: 'WRITE ME.',
    phase: ['night'],
    participantCondition: (player) => player.state.isAlive,
    targetCondition: (player, actor) => player.state.isAlive && player != actor, // can we adjust this to be 'and target is not the player participating in the event'

    input: {
      allowed: ['1', '2', '3', '4', '5', '6', '7', '8', '9'],
      confirmReq: true,
      allowNone: false,
      resultType: 'perPlayer',
      allowTies: false, // cannot end event while a tie is in place.
    },

    resolution: (event, game) => {
      // target is immune to kill actions this phase.
    },
  },
};

// --- Roles ---
export const ROLES = {
  villager: {
    name: 'villager',
    team: 'villagers',
    color: undefined,
    defaultActions: ['dummy'],
    defaultEvents: ['vote'],
  },
  werewolf: {
    name: 'werewolf',
    team: 'werewolves',
    color: '#ff6b6b',
    defaultActions: [],
    defaultEvents: ['vote', 'kill'],
  },
  seer: {
    name: 'seer',
    team: 'villagers',
    color: '#a1ff9b',
    defaultActions: [],
    defaultEvents: ['vote', 'protect'],
  },
  doctor: {
    name: 'doctor',
    team: 'villagers',
    color: '#9be2ff',
    defaultActions: [],
    defaultEvents: ['vote', 'protect'],
  },
};

// --- Minimum roles for auto-start ---
export const MINIMUM_ROLES = {
  4: { werewolf: 1, seer: 1 },
  5: { werewolf: 1, seer: 1 },
  6: { werewolf: 1, seer: 1 },
  7: { werewolf: 1, seer: 1 },
  8: { werewolf: 2, seer: 1 },
  9: { werewolf: 2, seer: 1, doctor: 1 },
};

export const DEFAULT_ROLE = 'villager';
