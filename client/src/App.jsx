import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Host from './pages/Host';
import Player from './pages/Player';
import Landing from './pages/Landing';
import DebugPlayers from './pages/DebugPlayers';
import Badge from './components/Badge';
import { useGameState } from './hooks/useGameState';

function App() {
  const { wsStatus } = useGameState(); // just for badge

  return (
    <Router>
      <Badge status={wsStatus} />
      <Routes>
        <Route path='/' element={<Landing />} />
        <Route path='/host' element={<Host />} />
        <Route path='/player/:id' element={<Player />} />
        <Route path='/player/debug' element={<DebugPlayers />} />
      </Routes>
    </Router>
  );
}

export default App;
