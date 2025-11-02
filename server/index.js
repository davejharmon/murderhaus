// server/index.js
import { getWSS, sendTo } from './utils/Broadcast.js';
import { gameManager } from './GameManager.js';
import { handleWSMessage } from './wsHandlers.js';

const wss = getWSS(8080);

wss.on('connection', (ws) => {
  console.log('Client connected');

  // Send current game state immediately
  sendTo(ws, { type: 'GAME_STATE_UPDATE', payload: gameManager.getState() });

  // Listen for messages from this client
  ws.on('message', (msg) => handleWSMessage(ws, msg));

  // Optional: handle disconnect
  ws.on('close', () => console.log('Client disconnected'));
});
