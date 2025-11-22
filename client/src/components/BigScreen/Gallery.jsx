import React, { useMemo } from 'react';
import styles from './BigScreen.module.css';
import anonImg from '../../assets/anon.png';

export default function Gallery({
  playerIds = [],
  gamePlayers = [],
  header,
  anonWhileAlive = false,
}) {
  // Resolve players from IDs and filter out missing ones
  const players = useMemo(() => {
    return playerIds
      .map((id) => gamePlayers.find((p) => p.id === id))
      .filter(Boolean);
  }, [playerIds, gamePlayers]);

  // Sort: if anonWhileAlive, keep dead players at the end
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

          // Determine if we should show enemy coloring
          const isEnemy = p.team === 'werewolves';

          // Determine CSS class
          const itemClass = [
            styles.galleryItem,
            isDead && !isEnemy ? styles.galleryDead : '',
            isDead && isEnemy ? styles.galleryDeadEnemy : '',
            !isDead && isEnemy && anonWhileAlive ? styles.galleryEnemy : '',
          ]
            .filter(Boolean)
            .join(' ');

          // Determine image
          const imgSrc =
            anonWhileAlive && !isDead
              ? anonImg
              : p.image
              ? `/images/players/${p.image}`
              : anonImg;

          return (
            <div key={p.id} className={itemClass}>
              <img src={imgSrc} alt={p.name} className={styles.galleryImg} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
