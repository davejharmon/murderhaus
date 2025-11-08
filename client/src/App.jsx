// src/App.jsx
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Host from './pages/Host';
import Player from './pages/Player';
import Landing from './pages/Landing';
import DebugPlayers from './pages/DebugPlayers';
import Badge from './components/Badge';
import { subscribe, subscribeStatus } from './ws';

function App() {
  const [gameState, setGameState] = useState(null);
  const [wsStatus, setWsStatus] = useState('disconnected');

  useEffect(() => {
    const unsubMsg = subscribe((msg) => {
      switch (msg.type) {
        case 'GAME_STATE_UPDATE':
          setGameState(msg.payload);
          break;

        case 'ERROR':
          console.warn(`[SERVER ERROR] ${msg.payload?.message}`);
          break;
      }
    });

    const unsubStatus = subscribeStatus(setWsStatus);

    return () => {
      unsubMsg();
      unsubStatus();
    };
  }, []);
  console.log(gameState);
  return (
    <Router>
      <Badge status={wsStatus} />

      <Routes>
        <Route
          path='/'
          element={<Landing gameState={gameState} wsStatus={wsStatus} />}
        />
        <Route
          path='/host'
          element={<Host gameState={gameState} wsStatus={wsStatus} />}
        />
        <Route
          path='/player/:id'
          element={<Player gameState={gameState} wsStatus={wsStatus} />}
        />
        <Route
          path='/player/debug'
          element={<DebugPlayers gameState={gameState} wsStatus={wsStatus} />}
        />
      </Routes>
    </Router>
  );
}

export default App;
