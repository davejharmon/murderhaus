let socket;
let listeners = [];

export function connect(onUpdate) {
  socket = new WebSocket('ws://localhost:8080');

  socket.onopen = () => {
    console.log('Connected to server');
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
  };

  socket.onerror = (err) => {
    console.error('WebSocket error:', err);
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
