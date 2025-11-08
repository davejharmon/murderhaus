// src/pages/Landing.jsx
import { useNavigate } from 'react-router-dom';
import { send } from '../ws';
import { Button } from '../components/Button';
import styles from './Landing.module.css';

export default function Landing({
  gameState = null,
  wsStatus = 'disconnected',
}) {
  const navigate = useNavigate();

  const players = gameState?.players || [];

  const claimSeat = () => {
    const existingIds = players.map((p) => p.id);
    let newSeat = 1;
    while (existingIds.includes(newSeat)) newSeat++;

    send('REGISTER_PLAYER', { id: newSeat });
    window.open(`/player/${newSeat}`, '_blank', 'noopener,noreferrer');
  };

  const claimHost = () => {
    window.open('/host', '_blank', 'noopener,noreferrer');
  };

  const openHostAndDashboard = () => {
    window.open('/host', '_blank', 'noopener,noreferrer');
    navigate('/debug/players');
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Murderhaus</h1>
      <p className={styles.subtitle}>Select your role to proceed</p>

      <div className={styles.buttonRow}>
        <Button label='Claim Host' onClick={claimHost} />
        <Button label='Claim Seat' onClick={claimSeat} />
        <Button label='Open Host + Dashboard' onClick={openHostAndDashboard} />
      </div>

      <p className={styles.status}>WS Status: {wsStatus}</p>

      {players.length > 0 && (
        <ul className={styles.playerList}>
          {players.map((p) => (
            <li key={p.id}>
              #{p.id} — {p.name || 'Unnamed'} {p.isAlive ? '' : '(dead)'}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
