import React, { useMemo } from 'react';
import { useGameState } from '../hooks/useGameState';
import Title from '../components/BigScreen/Title';
import Subtitle from '../components/BigScreen/Subtitle';
import EnemiesRemaining from '../components/BigScreen/EnemiesRemaining';
import PlayerGallery from '../components/BigScreen/PlayerGallery';
import SelectionResults from '../components/BigScreen/SelectionResults';
import BigPortraitUpdate from '../components/BigScreen/BigPortraitUpdate';
import styles from '../components/BigScreen/BigScreen.module.css';
import { usePageTitle } from '../hooks/usePageTitle';

export default function BigScreen() {
  const { players = [], gameMeta } = useGameState([
    'PLAYERS_UPDATE',
    'GAME_META_UPDATE',
  ]);
  usePageTitle('Big Screen');
  const {
    dayCount = 0,
    phase = null,
    currentEvents = [],
    gameStarted,
  } = gameMeta;

  const alivePlayers = useMemo(
    () => players.filter((p) => p.state?.isAlive),
    [players]
  );

  const enemies = useMemo(
    () => players.filter((p) => p.role === 'werewolf'),
    [players]
  );

  const voteEvent = useMemo(
    () => currentEvents.find((e) => e.action === 'vote'),
    [currentEvents]
  );
  // --- Check for any player who died this turn ---
  const diedThisTurn = useMemo(
    () => players.find((p) => p.state?.diedThisTurn),
    [players]
  );
  // --- Determine what content to show ---
  const displayView = useMemo(() => {
    if (diedThisTurn) {
      return (
        <>
          <BigPortraitUpdate
            player={diedThisTurn}
            title={`${diedThisTurn.name || 'Unknown'} murdered`}
            subtitle='Eliminated'
          />
          <EnemiesRemaining enemies={enemies} />
        </>
      );
    }
    if (!gameStarted) {
      return <Title text='GAME STARTING SOON' />;
    }

    if (phase === 'day') {
      if (!voteEvent) {
        return (
          <>
            <PlayerGallery players={players} />
            <Title text={`DAY ${dayCount}`} />
            <Subtitle text='ELIMINATION VOTING STARTS SOON' />
            <EnemiesRemaining enemies={enemies} />
          </>
        );
      }

      if (voteEvent && !voteEvent.resolved) {
        return (
          <>
            <PlayerGallery players={players} />
            <Title text={`DAY ${dayCount}`} />
            <Subtitle text='CHOOSE A PLAYER TO ELIMINATE' />
            <EnemiesRemaining enemies={enemies} />
          </>
        );
      }

      if (voteEvent && voteEvent.resolved) {
        return <SelectionResults voteEvent={voteEvent} />;
      }
    }

    if (phase === 'night') {
      return (
        <>
          <PlayerGallery players={players} />
          <Title text={`NIGHT ${dayCount}`} />
          <Subtitle text='EVERYBODY GO TO SLEEP' />
          <EnemiesRemaining enemies={enemies} />
        </>
      );
    }

    return <Title text='WAITING FOR GAME STATE...' />;
  }, [gameStarted, phase, dayCount, voteEvent, enemies, players]);

  return (
    <div className={styles.container}>
      <section className={styles.mainDisplay}>{displayView}</section>
    </div>
  );
}
