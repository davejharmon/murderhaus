import { WebSocketServer } from 'ws';
import { MAX_PLAYERS, PHASES, ROLES } from '../shared/constants.js';

const wss = new WebSocketServer({ port: 8080 });

let gameState = {
  phase: null,
  day: null,
  players: Array(MAX_PLAYERS).fill(null), // fixed-size array
  history: [],
};

// --- Utility ---
function broadcast(message) {
  wss.clients.forEach((client) => {
    if (client.readyState === 1) client.send(JSON.stringify(message));
  });
}

function sendTo(client, message) {
  if (client.readyState === 1) client.send(JSON.stringify(message));
}

function updateAll() {
  broadcast({ type: 'GAME_STATE_UPDATE', payload: gameState });
}

// --- Handle messages ---
function handleMessage(ws, msg) {
  const { type, payload } = msg;

  switch (type) {
    case 'REGISTER_PLAYER': {
      const i = payload.id; // number 0..8
      if (i < 0 || i >= MAX_PLAYERS) return;

      if (!gameState.players[i]) {
        gameState.players[i] = {
          id: i,
          name: `Player ${i}`,
          role: 'UNKNOWN',
          team: null, // 'CIRCLE', 'MURDERER'
          isAlive: true,
          isRevealed: false,
          vote: null, // id
          isConfirmed: false,
        };
        gameState.history.push(`Player ${i} joined the game`);
        updateAll();
      } else {
        // slot already taken
        sendTo(ws, { type: 'ERROR', payload: { message: 'Slot taken' } });
      }
      break;
    }
    case 'UPDATE_PLAYER_NAME': {
      const { id, name } = payload;
      if (id < 0 || id >= MAX_PLAYERS || !gameState.players[id]) {
        sendTo(ws, {
          type: 'ERROR',
          payload: { message: 'Invalid player ID' },
        });
        break;
      }

      gameState.players[id].name = name;
      gameState.history.push(`Player ${id} changed name to ${name}`);
      updateAll();
      break;
    }

    case 'START_GAME': {
      gameState.day = 1;
      gameState.phase = PHASES[0];
      gameState.history.push(`Game started: Day 1, ${PHASES[0]}`);
      updateAll();
      break;
    }

    case 'SET_PHASE': {
      let newPhase = payload?.phase;

      if (!newPhase) {
        const currentIndex = PHASES.indexOf(gameState.phase);
        if (currentIndex === -1 || currentIndex === PHASES.length - 1) {
          // if midnight or unknown phase, start next day
          gameState.day = (gameState.day ?? 0) + 1;
          newPhase = PHASES[0];
        } else {
          newPhase = PHASES[currentIndex + 1];
        }
      }

      gameState.phase = newPhase;
      gameState.history.push(`Phase set to ${newPhase}`);
      updateAll();
      break;
    }

    default:
      sendTo(ws, {
        type: 'ERROR',
        payload: { message: 'Unknown message type' },
      });
  }
}

// --- WebSocket ---
wss.on('connection', (ws) => {
  console.log('Client connected');
  sendTo(ws, { type: 'GAME_STATE_UPDATE', payload: gameState });

  ws.on('message', (data) => {
    try {
      handleMessage(ws, JSON.parse(data));
    } catch {
      sendTo(ws, { type: 'ERROR', payload: { message: 'Invalid JSON' } });
    }
  });

  ws.on('close', () => console.log('Client disconnected'));
});

console.log('WebSocket server running on ws://localhost:8080');
