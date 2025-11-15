// src/pages/Landing.jsx
import { useNavigate } from 'react-router-dom';
import { send } from '../ws';
import { Button } from '../components/Button';
import styles from './Landing.module.css';
import { useGameState } from '../hooks/useGameState';
import { usePageTitle } from '../hooks/usePageTitle';

export default function Landing() {
  const navigate = useNavigate();
  const { players = [], gameStarted } = useGameState([
    'PLAYERS_UPDATE',
    'GAME_META_UPDATE',
  ]);
  usePageTitle('Landing');
  const claimSeat = () => {
    const existingIds = new Set(players.map((p) => p.id));
    let newSeat = 1;
    while (existingIds.has(newSeat)) newSeat++;
    send('REGISTER_PLAYER', { id: newSeat });
    window.open(`/player/${newSeat}`, '_blank', 'noopener,noreferrer');
  };

  const claimHost = () => {
    window.open('/host', '_blank', 'noopener,noreferrer');
  };

  const claimScreen = () => {
    window.open('/screen', '_blank', 'noopener,noreferrer');
  };

  const openHostAndDashboard = () => {
    window.open('/host', '_blank', 'noopener,noreferrer'); // Host page
    window.open('/screen', '_blank', 'noopener,noreferrer'); // Big Screen page
    navigate('/player/debug'); // Debug player dashboard
  };

  const sortedPlayers = [...players].sort((a, b) => a.id - b.id);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Murderhaus</h1>
      <p className={styles.subtitle}>Select your role to proceed</p>

      <div className={styles.buttonRow}>
        <Button label='Claim Host' onClick={claimHost} />
        <Button label='Claim Seat' onClick={claimSeat} />
        <Button label='Claim Screen' onClick={claimScreen} />
        <Button
          label='Open Host + Dashboard + Screen'
          onClick={openHostAndDashboard}
        />
      </div>

      {players.length > 0 && (
        <ul className={styles.playerList}>
          {sortedPlayers.map((p) => (
            <li key={p.id}>
              #{p.id} — {p.name || 'Unnamed'} {p.isAlive ? '' : '(dead)'}
            </li>
          ))}
        </ul>
      )}

      <p className={styles.status}>
        WS Status: {gameStarted ? 'Game Started' : 'Waiting'}
      </p>
    </div>
  );
}
