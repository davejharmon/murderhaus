import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Host from './pages/Host';
import Player from './pages/Player';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path='/host' element={<Host />} />
        <Route path='/player/:id' element={<Player />} />
        <Route path='/dashboard' element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
