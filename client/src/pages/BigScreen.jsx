// src/pages/BigScreen.jsx
import React from 'react';
import { useSlides } from '../hooks/useSlides';
import { usePageTitle } from '../hooks/usePageTitle';

import Gallery from '../components/BigScreen/Gallery';
import Title from '../components/BigScreen/Title';
import Subtitle from '../components/BigScreen/Subtitle';
import CountdownTimer from '../components/BigScreen/CountdownTimer';
import PlayerUpdate from '../components/BigScreen/PlayerUpdate';
import EventUpdate from '../components/BigScreen/EventUpdate';
import GameUpdate from '../components/BigScreen/GameUpdate';

export default function BigScreen() {
  usePageTitle('Screen');

  const { active } = useSlides();

  if (!active) {
    return (
      <div className='bigscreen-empty'>
        <h1>Waiting for slides…</h1>
      </div>
    );
  }

  return (
    <div className='bigscreen'>
      {active.title && (
        <Title text={active.title.text} color={active.title.color} />
      )}
      {active.subtitle && <Subtitle text={active.subtitle} />}
      {active.gallery && (
        <Gallery
          players={active.gallery.players}
          header={active.gallery.header}
        />
      )}
      {active.countdown && <CountdownTimer startTime={active.countdown} />}
      {active.playerUpdate && (
        <PlayerUpdate
          player={active.playerUpdate.player}
          text={active.playerUpdate.text}
        />
      )}
      {active.eventUpdate && <EventUpdate event={active.eventUpdate} />}
      {active.gameUpdate && (
        <GameUpdate
          players={active.gameUpdate.players}
          text={active.gameUpdate.text}
        />
      )}
    </div>
  );
}
