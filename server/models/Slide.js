// /models/Slide.js
export class Slide {
  constructor({
    id,
    gallery,
    galleries = [], // new
    title,
    subtitle,
    countdown,
    playerUpdate,
    eventUpdate,
    gameUpdate,
    meta,
    order = null,
  } = {}) {
    this.id = id ?? crypto.randomUUID();
    this.gallery = gallery;
    this.galleries = galleries; // store multiple galleries
    this.title = title;
    this.subtitle = subtitle;
    this.countdown = countdown;
    this.playerUpdate = playerUpdate;
    this.eventUpdate = eventUpdate;
    this.gameUpdate = gameUpdate;
    this.meta = meta;
    this.order = order;

    this.typeFlags = {
      hasGallery: !!gallery || galleries.length > 0,
      hasTitle: !!title,
      hasSubtitle: !!subtitle,
      hasCountdown: countdown != null,
      hasPlayerUpdate: !!playerUpdate,
      hasEventUpdate: !!eventUpdate,
      hasGameUpdate: !!gameUpdate,
    };
  }

  // --- Factory / helper methods ---
  static title(text, color = null) {
    return new Slide({ title: { text, color } });
  }

  static subtitle(text) {
    return new Slide({ subtitle: text });
  }

  static countdown(seconds, titleText = null) {
    return new Slide({
      countdown: seconds,
      title: titleText ? { text: titleText } : null,
    });
  }

  static gallery(players = [], header = null) {
    return new Slide({ galleries: [{ players, header }] });
  }

  static galleries(listOfGalleries = []) {
    return new Slide({ galleries: listOfGalleries });
  }

  static playerUpdate(playerId, text) {
    return new Slide({ playerUpdate: { playerId, text } });
  }

  static eventUpdate(eventObj) {
    return new Slide({ eventUpdate: eventObj });
  }

  static gameUpdate(players, text) {
    return new Slide({ gameUpdate: { players, text } });
  }

  // templates

  static titleWithSubtitle(titleText, subtitleText, color = null) {
    return new Slide({
      title: { text: titleText, color },
      subtitle: subtitleText,
    });
  }

  static titleWithGallery(titleText, players, header = null, color = null) {
    return new Slide({
      title: { text: titleText, color },
      gallery: { players, header },
    });
  }

  static countdownWithSubtitle(seconds, subtitleText) {
    return new Slide({ countdown: seconds, subtitle: subtitleText });
  }

  static eventStart(players, event) {
    const topGallery = { players };
    const bottomGallery = {
      players: players.filter((p) => p.team === 'werewolves'),
      anonWhileAlive: true,
    };

    return new Slide({
      galleries: [topGallery, bottomGallery],
      title: { text: `${event.eventName} starting soon` },
      subtitle: `${event.eventDef.description}`,
      countdown: 360,
      order: ['galleries[0]', 'title', 'subtitle', 'galleries[1]'],
    });
  }

  static eventTimer(players) {
    const topGallery = { players };
    const bottomGallery = {
      players: players.filter((p) => p.team === 'werewolves'),
      anonWhileAlive: true,
    };

    return new Slide({
      galleries: [topGallery, bottomGallery],
      subtitle: `${bottomGallery.length} murderers remain`,
      countdown: 45,
      order: ['galleries[0]', 'countdown', 'galleries[1]'],
    });
  }
}
