// src/components/BigScreen/VoteResults.jsx
import React, { useMemo } from 'react';
import styles from './BigScreen.module.css';

export default function VoteResults({ players, voteData }) {
  const { results, completedBy, confirmReq } = voteData;

  // Map players by ID for quick lookup
  const playerMap = useMemo(() => {
    const map = new Map();
    players.forEach((p) => map.set(p.id, p));
    return map;
  }, [players]);

  // Build target → [voterIds]
  const counts = useMemo(() => {
    const map = new Map();

    // Only include voters that completed their vote if confirmReq = true
    const validVoters = confirmReq
      ? completedBy
      : Object.keys(results).map((id) => Number(id));

    validVoters.forEach((voterId) => {
      const targetId = results[voterId];
      if (!targetId) return;

      if (!map.has(targetId)) map.set(targetId, []);
      map.get(targetId).push(voterId);
    });

    // Convert → array of { target, voters[] }
    const arr = Array.from(map.entries()).map(([targetId, voterIds]) => ({
      target: playerMap.get(Number(targetId)),
      voters: voterIds.map((id) => playerMap.get(Number(id))),
    }));

    // Sort by descending votes
    arr.sort((a, b) => b.voters.length - a.voters.length);

    return arr;
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
            {voters.map((v) => (
              <img
                key={`voter-${v.id}`}
                src={`/images/players/${v.image}`}
                alt={v.name}
                className={styles.voterPortrait}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
