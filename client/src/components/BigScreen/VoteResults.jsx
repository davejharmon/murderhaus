// src/components/BigScreen/VoteResults.jsx
import React, { useMemo } from 'react';
import styles from './BigScreen.module.css';
import anonImg from '../../assets/anon.png';

export default function VoteResults({ players, voteData }) {
  const { results, completedBy, confirmReq } = voteData;

  // Fast lookup by ID
  const playerMap = useMemo(
    () => new Map(players.map((p) => [p.id, p])),
    [players]
  );

  const counts = useMemo(() => {
    const tally = new Map();

    const voters = confirmReq ? completedBy : Object.keys(results).map(Number);

    voters.forEach((voterId) => {
      const targetId = results[voterId];
      if (!targetId) return;

      if (!tally.has(targetId)) tally.set(targetId, []);
      const voter = playerMap.get(voterId);
      if (voter) tally.get(targetId).push(voter);
    });

    return Array.from(tally.entries())
      .map(([targetId, voterObjs]) => ({
        target: playerMap.get(Number(targetId)),
        voters: voterObjs,
      }))
      .filter((row) => row.target)
      .sort((a, b) => b.voters.length - a.voters.length);
  }, [results, completedBy, confirmReq, playerMap]);

  const tooMany = counts.length > 5;

  return (
    <div
      className={`${styles.voteResultsContainer} ${
        tooMany ? styles.twoColumn : ''
      }`}
    >
      {counts.map(({ target, voters }) => (
        <div key={target.id} className={styles.voteRow}>
          <div className={styles.voteTarget}>
            <span className={styles.targetName}>{target.name}</span>
          </div>

          <div className={styles.voterList}>
            {voters.map((v) => {
              const src = v.image ? `/images/players/${v.image}` : anonImg;
              return (
                <img
                  key={`voter-${v.id}`}
                  src={src}
                  alt={v.name}
                  className={`${styles.portrait} ${styles.small}`}
                />
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
