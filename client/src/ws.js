let socket;
let listeners = [];
let statusListeners = [];
let reconnectInterval = 2000; // 2s between retries
let shouldReconnect = true;

export function connect(onUpdate) {
  notifyStatus('connecting');
  socket = new WebSocket('ws://localhost:8080');

  socket.onopen = () => {
    console.log('Connected to server');
    notifyStatus('connected');
  };

  socket.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.type === 'GAME_STATE_UPDATE') {
      onUpdate(msg.payload);
    }
    listeners.forEach((fn) => fn(msg));
  };

  socket.onclose = () => {
    console.log('Disconnected from server');
    notifyStatus('disconnected');
    if (shouldReconnect) {
      setTimeout(() => {
        console.log('Attempting to reconnect...');
        connect(onUpdate);
      }, reconnectInterval);
    }
  };

  socket.onerror = (err) => {
    console.error('WebSocket error:', err);
    notifyStatus('error');
    socket.close(); // trigger reconnect
  };
}

export function send(type, payload = {}) {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({ type, payload }));
  } else {
    console.warn('WebSocket not connected');
  }
}

export function subscribe(fn) {
  listeners.push(fn);
  return () => {
    listeners = listeners.filter((l) => l !== fn);
  };
}

export function subscribeStatus(fn) {
  statusListeners.push(fn);
  return () => {
    statusListeners = statusListeners.filter((l) => l !== fn);
  };
}

function notifyStatus(status) {
  statusListeners.forEach((fn) => fn(status));
}
