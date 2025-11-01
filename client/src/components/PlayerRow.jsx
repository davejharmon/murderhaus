import { Bulb } from './Bulb';
import { NumberEmoji } from './NumberEmoji';
import { PlayerName } from './PlayerName';
import { Button } from './Button';

export function PlayerRow({ player, gameState, setGameState, DEBUG = false }) {
  // Defensive guard
  if (!player) return null;

  return (
    <div style={styles.playerRow}>
      <div style={styles.playerInfo}>
        <Bulb player={player} phase={gameState.phase} />
        <span style={styles.playerBulb}>
          <NumberEmoji number={player.id} />
        </span>
        <PlayerName
          player={player}
          gameState={gameState}
          setGameState={setGameState}
        />
        <span style={styles.playerRole}>{player.role}</span>
        <Button label='🔪' />
        <Button label='👁️' />
      </div>

      {DEBUG && (
        <div style={styles.debugLine}>
          {Object.entries(player)
            .map(([key, value]) => {
              const displayValue =
                value === null
                  ? 'null'
                  : typeof value === 'object'
                  ? JSON.stringify(value)
                  : String(value).toUpperCase();
              return `${key}: ${displayValue}`;
            })
            .join(', ')}
        </div>
      )}
    </div>
  );
}

const styles = {
  playerRow: {
    display: 'flex',
    flexDirection: 'column',
    padding: '0.75rem 1rem',
    backgroundColor: '#f0f0f0',
    borderRadius: '0.5rem',
  },
  playerInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    fontSize: '1.2rem',
    fontWeight: '500',
  },
  playerRole: {
    color: 'blue',
  },
  debugLine: {
    fontSize: '0.8em',
    color: 'gray',
    marginTop: '4px',
  },
  playerBulb: {},
};
