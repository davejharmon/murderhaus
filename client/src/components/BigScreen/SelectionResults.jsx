// src/components/BigScreen/SelectionResults.jsx
import React, { useMemo } from 'react';
import styles from './BigScreen.module.css';

export default function SelectionResults({
  voteEvent,
  players,
  anonymiseSelectors = false,
}) {
  if (!voteEvent || !voteEvent.results) return null;

  const { results } = voteEvent;

  /** -----------------------------------------
   * Build vote counts per target
   * ----------------------------------------- */
  const counts = useMemo(() => {
    const tally = {};

    Object.values(results).forEach((targetId) => {
      tally[targetId] = (tally[targetId] || 0) + 1;
    });

    return tally;
  }, [results]);

  /** -----------------------------------------
   * Build selector list per target
   * (ignored if anonymised)
   * ----------------------------------------- */
  const selectors = useMemo(() => {
    if (anonymiseSelectors) return {};

    const map = {};

    Object.entries(results).forEach(([actorId, targetId]) => {
      if (!map[targetId]) map[targetId] = [];

      const p = players.find((pl) => pl.id === Number(actorId));
      map[targetId].push(p ? p.name : `Player ${actorId}`);
    });

    return map;
  }, [results, players, anonymiseSelectors]);

  /** -----------------------------------------
   * Sorted list of players (targets)
   * ----------------------------------------- */
  const sortedPlayers = useMemo(() => {
    return [...players]
      .filter((p) => p.isAlive !== false)
      .sort((a, b) => {
        const ca = counts[a.id] || 0;
        const cb = counts[b.id] || 0;
        return cb - ca; // highest votes first
      });
  }, [players, counts]);

  return (
    <div className={styles.resultsContainer}>
      <h1 className={styles.resultsHeader}>Vote Results</h1>

      <div className={styles.resultsGrid}>
        {sortedPlayers.map((p) => {
          const voteCount = counts[p.id] || 0;
          const selectorsList = selectors[p.id] || [];

          return (
            <div key={p.id} className={styles.resultCard}>
              <div
                className={styles.resultPortrait}
                style={{ borderColor: p.color }}
              >
                <img
                  src={`/avatars/${p.image}`}
                  alt={p.name}
                  className={styles.resultImage}
                />
              </div>

              <div className={styles.resultName}>{p.name}</div>
              <div className={styles.resultVotes}>
                {voteCount} {voteCount === 1 ? 'vote' : 'votes'}
              </div>

              {!anonymiseSelectors && selectorsList.length > 0 && (
                <div className={styles.selectorList}>
                  {selectorsList.map((s, idx) => (
                    <div key={idx} className={styles.selectorBadge}>
                      {s}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
