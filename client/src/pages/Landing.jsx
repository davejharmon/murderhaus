import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { connect, subscribe, subscribeStatus, send } from '../ws';
import { Button } from '../components/Button';
import styles from './Landing.module.css';

export default function Landing() {
  const navigate = useNavigate();
  const [players, setPlayers] = useState([]);
  const [wsStatus, setWsStatus] = useState('disconnected');

  useEffect(() => {
    connect();

    const unsubMsg = subscribe((msg) => {
      if (msg.type === 'GAME_STATE_UPDATE' && msg.payload) {
        const { players: pl = [] } = msg.payload;
        setPlayers(pl.filter(Boolean));
      }
    });

    const unsubStatus = subscribeStatus(setWsStatus);

    return () => {
      unsubMsg();
      unsubStatus();
    };
  }, []);

  const claimSeat = async () => {
    const existingIds = players.map((p) => p.id);
    let newSeat = 1;
    while (existingIds.includes(newSeat)) newSeat++;

    await connect();
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
