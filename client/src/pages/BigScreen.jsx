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

export default function BigScreen() {
  usePageTitle('Screen');
  const { active, buffer } = useSlides();
  const { gameMeta } = useGameState(['GAME_META_UPDATE']);

  const slide = active || getFallbackSlide(gameMeta);

  if (!slide) {
    // placeholder while waiting for server/fallback
    return <div className={styles.container} />;
  }

  const renderSlideItem = (slide, key) => {
    switch (key) {
      case 'title':
        return slide.title ? (
          <Title
            key='title'
            text={slide.title.text}
            color={slide.title.color}
          />
        ) : null;
      case 'subtitle':
        return slide.subtitle ? (
          <Subtitle key='subtitle' text={slide.subtitle} />
        ) : null;
      case 'galleries':
        return slide.galleries?.map((g, i) => (
          <Gallery key={`gallery-${i}`} players={g.players} header={g.header} />
        ));
      case key.match(/^galleries\[(\d+)\]$/)?.input:
        const index = parseInt(key.match(/\d+/)[0], 10);
        return slide.galleries?.[index] ? (
          <Gallery
            key={key}
            players={slide.galleries[index].players}
            header={slide.galleries[index].header}
            anonWhileAlive={slide.galleries[index].anonWhileAlive}
          />
        ) : null;
      case 'countdown':
        return slide.countdown != null ? (
          <CountdownTimer key='countdown' countdown={slide.countdown} />
        ) : null;
      case 'playerUpdate':
        return slide.playerUpdate ? (
          <PlayerUpdate
            key='playerUpdate'
            player={slide.playerUpdate.player}
            text={slide.playerUpdate.text}
          />
        ) : null;
      case 'eventUpdate':
        return slide.eventUpdate ? (
          <EventUpdate key='eventUpdate' event={slide.eventUpdate} />
        ) : null;
      case 'gameUpdate':
        return slide.gameUpdate ? (
          <GameUpdate
            key='gameUpdate'
            players={slide.gameUpdate.players}
            text={slide.gameUpdate.text}
          />
        ) : null;
      default:
        return null;
    }
  };

  const renderOrder = slide.order || [
    'image',
    'title',
    'galleries',
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
          {slide.image && (
            <SingleImage path={slide.image.path} alt={slide.image.alt} />
          )}
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
      image: { path: '/src/assets/logo.png', alt: 'Big Time Murder' },
      title: { text: 'GAME STARTING SOON', color: '#888' },
      subtitle: `${players ? players.length : 0} players connected`,
    };
  }

  const sub =
    gameMeta.pendingEvents?.length > 0
      ? `${gameMeta.pendingEvents[0]} starts soon.`
      : 'Warm skies, open hearts.';
  const topGallery = { players: gameMeta.players };
  const werewolves = gameMeta.players.filter((p) => p.team === 'werewolves');
  const bottomGallery = {
    players: werewolves,
    header: `${werewolves.length} enemies remain`,
    anonWhileAlive: true,
  };

  if (phase === 'day') {
    return {
      id: 'fallback-day',
      title: { text: `Day ${gameMeta.dayCount}`, color: '#fff' },
      subtitle: sub,
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
      subtitle: sub,
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
