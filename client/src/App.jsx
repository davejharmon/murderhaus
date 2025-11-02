import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Host from './pages/Host';
import Player from './pages/Player';
import Landing from './pages/Landing';
import Badge from './components/Badge';
import DebugPlayers from './pages/DebugPlayers';

function App() {
  return (
    <Router>
      <Badge />
      <Routes>
        <Route path='/' element={<Landing />} />
        <Route path='/host' element={<Host />} />
        <Route path='/player/:id' element={<Player />} />
        <Route path='/debug/players' element={<DebugPlayers />} />
      </Routes>
    </Router>
  );
}

export default App;
