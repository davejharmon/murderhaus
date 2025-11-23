import React, { useMemo } from 'react';
import styles from './BigScreen.module.css';
import anonImg from '../../assets/anon.png';

export default function Gallery({
  playerIds = [],
  gamePlayers = [],
  header,
  anonWhileAlive = false,
}) {
  const players = useMemo(() => {
    return playerIds
      .map((id) => gamePlayers.find((p) => p.id === id))
      .filter(Boolean);
  }, [playerIds, gamePlayers]);

  // Optionally push dead players to the end
  const sortedPlayers = useMemo(() => {
    if (!anonWhileAlive) return players;
    return [...players].sort(
      (a, b) => (b.state?.isAlive ? 1 : 0) - (a.state?.isAlive ? 1 : 0)
    );
  }, [players, anonWhileAlive]);

  return (
    <div className={styles.gallery}>
      {header && <div className={styles.galleryHeader}>{header}</div>}

      <div className={styles.galleryFlow}>
        {sortedPlayers.map((p) => {
          const isDead = !p.state?.isAlive;
          const isEnemy = p.team === 'werewolves';

          const imgSrc =
            anonWhileAlive && !isDead
              ? anonImg
              : p.image
              ? `/images/players/${p.image}`
              : anonImg;

          // Unified portrait class handling
          const portraitClasses = [
            styles.portrait,
            styles.small, // gallery portraits are the "small" token
            isEnemy && isDead ? styles.enemy : '',
            isDead ? styles.dead : '',
          ]
            .filter(Boolean)
            .join(' ');

          return (
            <div key={p.id} className={styles.galleryItem}>
              <img src={imgSrc} alt={p.name} className={portraitClasses} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
