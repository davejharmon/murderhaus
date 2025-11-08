import { getWSS } from './utils/Broadcast.js';
import { handleWSMessage, handleNewConnection } from './wsHandlers.js';

const wss = getWSS(8080);

wss.on('connection', (ws) => {
  console.log('Client connected');

  handleNewConnection(ws);

  ws.on('message', (msg) => handleWSMessage(ws, msg));
  ws.on('close', () => console.log('Client disconnected'));
});
