// /models/Slide.js
export class Slide {
  constructor({
    id,
    gallery,
    title,
    subtitle,
    countdown,
    playerUpdate,
    eventUpdate,
    gameUpdate,
    meta,
  } = {}) {
    this.id = id ?? crypto.randomUUID();
    this.gallery = gallery;
    this.title = title;
    this.subtitle = subtitle;
    this.countdown = countdown;
    this.playerUpdate = playerUpdate;
    this.eventUpdate = eventUpdate;
    this.gameUpdate = gameUpdate;
    this.meta = meta;

    this.typeFlags = {
      hasGallery: !!gallery,
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
    return new Slide({ gallery: { players, header } });
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
}
