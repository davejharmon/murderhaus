import React from 'react';
import styles from './BigScreen.module.css';
import anonImg from '../../assets/anon.png'; // fallback placeholder

export default function Gallery({
  players = [],
  header,
  anonWhileAlive = false,
}) {
  const sortedPlayers = anonWhileAlive
    ? [...players].sort(
        (a, b) => (b.state?.isAlive ? 1 : 0) - (a.state?.isAlive ? 1 : 0)
      )
    : players;

  return (
    <div className={styles.gallery}>
      {header && <div className={styles.galleryHeader}>{header}</div>}

      <div className={styles.galleryFlow}>
        {sortedPlayers.map((p) => {
          const isDead = !p.state?.isAlive;

          const itemClass = [
            styles.galleryItem,
            isDead ? styles.galleryDead : '',
          ]
            .filter(Boolean)
            .join(' ');

          // Use anon placeholder if needed, otherwise map to public/players folder
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
