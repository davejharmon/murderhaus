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

  if (!slide) {
    // placeholder while waiting for server/fallback
    return <div className={styles.container} />;
  }

  const slideRenderers = {
    title: (slide) =>
      slide.title ? (
        <Title key='title' text={slide.title.text} color={slide.title.color} />
      ) : null,
    image: (slide) =>
      slide.image ? (
        <SingleImage
          path={slide.image.path}
          alt={slide.image.alt}
          key='image'
        />
      ) : null,
    subtitle: (slide) =>
      slide.subtitle ? <Subtitle key='subtitle' text={slide.subtitle} /> : null,
    countdown: (slide) =>
      slide.countdown != null ? (
        <CountdownTimer key='countdown' countdown={slide.countdown} />
      ) : null,
    playerUpdate: (slide) =>
      slide.playerUpdate ? (
        <PlayerUpdate
          key='playerUpdate'
          player={gameMeta.players.find(
            (p) => p.id === slide.playerUpdate.playerId
          )}
          text={slide.playerUpdate.text}
        />
      ) : null,
    eventUpdate: (slide) =>
      slide.eventUpdate ? (
        <EventUpdate key='eventUpdate' event={slide.eventUpdate} />
      ) : null,
    gameUpdate: (slide) =>
      slide.gameUpdate ? (
        <GameUpdate
          key='gameUpdate'
          players={slide.gameUpdate.playerIds.map((id) =>
            gameMeta.players.find((p) => p.id === id)
          )}
          text={slide.gameUpdate.text}
        />
      ) : null,
    voteResults: (slide) =>
      slide.voteResults ? (
        <VoteResults players={gameMeta.players} voteData={slide.voteResults} />
      ) : null,
    galleries: (slide) =>
      slide.galleries?.map((g, i) => (
        <Gallery
          key={`gallery-${i}`}
          playerIds={g.playerIds}
          gamePlayers={gameMeta.players}
          header={g.header}
          anonWhileAlive={g.anonWhileAlive}
        />
      )),
  };

  // Final renderer
  const renderSlideItem = (slide, key) => {
    // Handle indexed galleries like galleries[0], galleries[1]
    const galleryIndexMatch = key.match(/^galleries\[(\d+)\]$/);
    if (galleryIndexMatch) {
      const index = parseInt(galleryIndexMatch[1], 10);
      const g = slide.galleries?.[index];
      return g ? (
        <Gallery
          key={key}
          playerIds={g.playerIds}
          gamePlayers={gameMeta.players}
          header={g.header}
          anonWhileAlive={g.anonWhileAlive}
        />
      ) : null;
    }

    // Use slideRenderers map
    return slideRenderers[key]?.(slide) ?? null;
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

// Fallback slide generator
function getFallbackSlide(gameMeta) {
  const { gameStarted, phase, players } = gameMeta || {};
  if (!gameStarted) {
    return {
      id: 'fallback-start',
      image: { path: '/images/logo.png', alt: 'Big Time Murder' },
      title: { text: 'GAME STARTING SOON', color: '#888' },
      subtitle: `${players ? players.length : 0} players connected`,
      order: ['title', 'image', 'subtitle'],
    };
  }

  const topGallery = { playerIds: gameMeta.players.map((p) => p.id) };
  const werewolves = gameMeta.players.filter((p) => p.team === 'werewolves');
  const aliveWerewolves = werewolves.filter((p) => p.state?.isAlive);

  const bottomGallery = {
    playerIds: werewolves.map((p) => p.id),
    header: `${aliveWerewolves.length} enemies remain`,
    anonWhileAlive: true,
  };

  if (phase === 'day') {
    return {
      id: 'fallback-day',
      title: { text: `Day ${gameMeta.dayCount}`, color: '#fff' },
      subtitle: 'No sign of rain',
      galleries: [topGallery, bottomGallery],
      order: ['galleries[0]', 'title', 'subtitle', 'galleries[1]'],
    };
  }

  if (phase === 'night') {
    return {
      id: 'fallback-night',
      title: {
        text: `Night ${gameMeta.dayCount}`,
        color: TEAMS.werewolves.color,
      },
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
