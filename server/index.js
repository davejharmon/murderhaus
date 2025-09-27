// server/index.js
const WebSocket = require('ws');
const { MAX_PLAYERS } = require('./constants');
const wss = new WebSocket.Server({ port: 8080 });

let gameState = {
  phase: 'lobby', // lobby | day | night | voting | reveal
  players: {}, // id -> { id, name, alive, role, roleRevealed, vote }
  history: [],
};

function broadcast(message, exclude = null) {
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN && client !== exclude) {
      client.send(JSON.stringify(message));
    }
  });
}

function sendTo(client, message) {
  if (client.readyState === WebSocket.OPEN) {
    client.send(JSON.stringify(message));
  }
}

function updateAll() {
  broadcast({
    type: 'GAME_STATE_UPDATE',
    payload: gameState,
  });
}

function handleMessage(ws, msg) {
  const { type, payload } = msg;

  switch (type) {
    case 'REGISTER_PLAYER': {
      const id = String(payload.id);
      if (!gameState.players[id]) {
        gameState.players[id] = {
          id,
          name: payload.name,
          role: 'Villager',
          team: true,
          isAlive: true,
          isRevealed: false,
          vote: null,
        };
        gameState.history.push(`${payload.name} joined the game`);
        updateAll();
      } else {
        // If they already exist, just re-sync
        sendTo(ws, { type: 'GAME_STATE_UPDATE', payload: gameState });
      }
      break;
    }

    case 'SET_PHASE':
      gameState.phase = payload.phase;
      gameState.history.push(`Phase set to ${payload.phase}`);
      updateAll();
      break;

    case 'VOTE':
      if (gameState.players[payload.voterId]?.alive) {
        gameState.players[payload.voterId].vote = payload.targetId;
        updateAll();
      }
      break;

    case 'CONFIRM_VOTE':
      if (gameState.players[payload.voterId]) {
        gameState.history.push(
          `${gameState.players[payload.voterId].name} confirmed their vote`
        );
        updateAll();
      }
      break;

    case 'TALLY_VOTES':
      tallyVotes();
      break;

    case 'REVEAL_ROLE':
      if (gameState.players[payload.id]) {
        gameState.players[payload.id].roleRevealed = true;
        gameState.history.push(
          `${gameState.players[payload.id].name} revealed their role`
        );
        updateAll();
      }
      break;

    default:
      sendTo(ws, {
        type: 'ERROR',
        payload: { message: 'Unknown message type' },
      });
  }
}

function tallyVotes() {
  const votes = {};
  Object.values(gameState.players).forEach((p) => {
    if (p.alive && p.vote) {
      votes[p.vote] = (votes[p.vote] || 0) + 1;
    }
  });

  let eliminated = null;
  let maxVotes = 0;
  for (const [id, count] of Object.entries(votes)) {
    if (count > maxVotes) {
      maxVotes = count;
      eliminated = id;
    }
  }

  if (eliminated) {
    gameState.players[eliminated].alive = false;
    gameState.history.push(
      `${gameState.players[eliminated].name} was eliminated with ${maxVotes} votes`
    );
  }

  updateAll();
}

wss.on('connection', (ws) => {
  console.log('New client connected');

  // Send initial state
  sendTo(ws, { type: 'GAME_STATE_UPDATE', payload: gameState });

  ws.on('message', (data) => {
    try {
      const msg = JSON.parse(data);
      handleMessage(ws, msg);
    } catch (err) {
      sendTo(ws, { type: 'ERROR', payload: { message: 'Invalid JSON' } });
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

console.log('WebSocket server running on ws://localhost:8080');
