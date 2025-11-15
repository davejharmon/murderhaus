// src/components/BigScreen/SelectionResults.jsx
import React from 'react';
import { NumberEmoji } from '../NumberEmoji';
import styles from './BigScreen.module.css';

export default function SelectionResults({ voteEvent }) {
  if (!voteEvent || !voteEvent.results) return null;

  return (
    <div className={styles.selectionResults}>
      <h2>VOTING RESULTS</h2>
      {voteEvent.results.map((result, idx) => (
        <div key={idx} className={styles.voteResult}>
          {result.player.name}{' '}
          {result.votes.map((v, i) => (
            <NumberEmoji key={i} number={v} />
          ))}
        </div>
      ))}
    </div>
  );
}
