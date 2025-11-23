// src/pages/BigScreen.jsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSlides } from '../hooks/useSlides';
import { usePageTitle } from '../hooks/usePageTitle';
import styles from '../components/BigScreen/BigScreen.module.css';
import SingleImage from '../components/BigScreen/SingleImage';
import Gallery from '../components/BigScreen/Gallery';
import Title from '../components/BigScreen/Title';
import Subtitle from '../components/BigScreen/Subtitle';
import CountdownTimer from '../components/BigScreen/CountdownTimer';
import PlayerUpdate from '../components/BigScreen/PlayerUpdate';
import EventUpdate from '../components/BigScreen/EventUpdate';
import GameUpdate from '../components/BigScreen/GameUpdate';
import { useGameState } from '../hooks/useGameState';
import { TEAMS } from '@shared/constants';
import VoteResults from '../components/BigScreen/VoteResults';

export default function BigScreen() {
  usePageTitle('Screen');
  const { active, buffer } = useSlides();
  const { gameMeta } = useGameState(['GAME_META_UPDATE']);

  const slide = buffer[active] || getFallbackSlide(gameMeta);
  if (!slide) return <div className={styles.container} />;

  /** --- Local helpers --- */
  const getPlayer = (id) => gameMeta?.players.find((p) => p.id === id) || null;

  const renderGallery = (gallery, key) => {
    if (!gallery) return null;
    return (
      <Gallery
        key={key}
        playerIds={gallery.playerIds}
        gamePlayers={gameMeta.players}
        header={gallery.header}
        anonWhileAlive={gallery.anonWhileAlive}
      />
    );
  };

  const slideRenderers = {
    title: (s) =>
      s.title && (
        <Title key='title' text={s.title.text} color={s.title.color} />
      ),
    image: (s) =>
      s.image && (
        <SingleImage key='image' path={s.image.path} alt={s.image.alt} />
      ),
    subtitle: (s) =>
      s.subtitle && <Subtitle key='subtitle' text={s.subtitle} />,
    countdown: (s) =>
      s.countdown != null && (
        <CountdownTimer key='countdown' countdown={s.countdown} />
      ),
    playerUpdate: (s) =>
      s.playerUpdate && (
        <PlayerUpdate
          key='playerUpdate'
          player={getPlayer(s.playerUpdate.playerId)}
          text={s.playerUpdate.desc}
          showRole={s.playerUpdate.showRole}
        />
      ),
    eventUpdate: (s) =>
      s.eventUpdate && <EventUpdate key='eventUpdate' event={s.eventUpdate} />,
    gameUpdate: (s) =>
      s.gameUpdate && (
        <GameUpdate
          key='gameUpdate'
          players={s.gameUpdate.playerIds.map(getPlayer)}
          text={s.gameUpdate.text}
        />
      ),
    voteResults: (s) =>
      s.voteResults && (
        <VoteResults players={gameMeta.players} voteData={s.voteResults} />
      ),
    galleries: (s) =>
      s.galleries?.map((g, i) => renderGallery(g, `gallery-${i}-${s.id}`)),
  };

  const renderSlideItem = (s, key) => {
    // handle indexed galleries like galleries[0], galleries[1]
    const match = key.match(/^galleries\[(\d+)\]$/);
    if (match) {
      const index = parseInt(match[1], 10);
      return renderGallery(s.galleries?.[index], key);
    }
    return slideRenderers[key]?.(s) || null;
  };

  const renderOrder = slide.order || [
    'image',
    'title',
    'galleries',
    'voteResults',
    'subtitle',
    'countdown',
    'playerUpdate',
    'eventUpdate',
    'gameUpdate',
  ];

  return (
    <div className={styles.container}>
      <AnimatePresence mode='wait'>
        <motion.div
          key={slide.id || 'fallback'}
          className={styles.slideFlex}
          initial={{ opacity: 0, y: 20, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.98 }}
          transition={{ duration: 0.35 }}
          style={{ width: '100%' }}
        >
          {renderOrder.map((key) => renderSlideItem(slide, key))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// --- Fallback slide generator ---
function getFallbackSlide(game) {
  const { gameStarted, phase, players, dayCount } = game || {};
  if (!gameStarted) {
    return {
      id: 'fallback-start',
      image: { path: '/images/logo.png', alt: 'Big Time Murder' },
      title: { text: 'GAME STARTING SOON', color: '#888' },
      subtitle: `${players?.length || 0} players connected`,
      order: ['title', 'image', 'subtitle'],
    };
  }

  const topGallery = { playerIds: players.map((p) => p.id) };
  const werewolves = players.filter((p) => p.team === 'werewolves');
  const aliveWerewolves = werewolves.filter((p) => p.state?.isAlive);
  const bottomGallery = {
    playerIds: werewolves.map((p) => p.id),
    header: `${aliveWerewolves.length} enemies remain`,
    anonWhileAlive: true,
  };

  if (phase === 'day') {
    return {
      id: 'fallback-day',
      title: { text: `Day ${dayCount}`, color: '#fff' },
      subtitle: 'No sign of rain',
      galleries: [topGallery, bottomGallery],
      order: ['galleries[0]', 'title', 'subtitle', 'galleries[1]'],
    };
  }

  if (phase === 'night') {
    return {
      id: 'fallback-night',
      title: { text: `Night ${dayCount}`, color: TEAMS.werewolves.color },
      subtitle: `Shepherd's delight`,
      galleries: [topGallery, bottomGallery],
      order: ['galleries[0]', 'title', 'subtitle', 'galleries[1]'],
    };
  }

  return {
    id: 'fallback-safe',
    title: { text: 'Game Running', color: '#888' },
    subtitle: `Phase: ${phase}`,
  };
}
