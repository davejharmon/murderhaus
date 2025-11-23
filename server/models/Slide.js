// /models/Slide.js
export class Slide {
  constructor({
    id,
    gallery, // single gallery (optional)
    galleries = [], // multiple galleries
    title,
    subtitle,
    countdown,
    playerUpdate,
    eventUpdate,
    gameUpdate,
    voteResults,
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
    this.voteResults = voteResults;
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
      hasVoteResults: !!voteResults,
    };
  }

  // -------------------------
  // Helper / Factory Methods
  // -------------------------

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

  /** Galleries now only store player IDs */
  static gallery(playerIds = [], header = null, anonWhileAlive = false) {
    return new Slide({
      galleries: [{ playerIds, header, anonWhileAlive }],
    });
  }

  static galleries(listOfGalleries = []) {
    // listOfGalleries: [{ playerIds, header, anonWhileAlive }]
    return new Slide({ galleries: listOfGalleries });
  }

  static playerUpdate(playerId, text) {
    console.log(`[SLIDE] Building player update`);
    return new Slide({ playerUpdate: { playerId, text } });
  }

  static eventUpdate(eventObj) {
    return new Slide({ eventUpdate: eventObj });
  }

  static gameUpdate(playerIds = [], text) {
    return new Slide({ gameUpdate: { playerIds, text } });
  }

  // -------------------------
  // Templates
  // -------------------------

  static titleWithSubtitle(titleText, subtitleText, color = null) {
    return new Slide({
      title: { text: titleText, color },
      subtitle: subtitleText,
    });
  }

  static titleWithGallery(
    titleText,
    playerIds = [],
    header = null,
    color = null
  ) {
    return new Slide({
      title: { text: titleText, color },
      gallery: { playerIds, header },
    });
  }

  static countdownWithSubtitle(seconds, subtitleText) {
    return new Slide({ countdown: seconds, subtitle: subtitleText });
  }

  static eventStart(playerIds = [], enemyIds = [], event) {
    return new Slide({
      galleries: [playerIds, enemyIds],
      title: { text: `${event.eventName} starting soon` },
      subtitle: event.eventDef?.description ?? '',
      countdown: 360,
      order: ['galleries[0]', 'title', 'subtitle', 'galleries[1]'],
    });
  }

  static eventTimer(playerIds = [], enemyIds = []) {
    return new Slide({
      galleries: [playerIds, enemyIds],
      subtitle: `${enemyIds.length} murderers remain`,
      countdown: 45,
      order: ['galleries[0]', 'countdown', 'subtitle', 'galleries[1]'],
    });
  }

  static voteResults(event) {
    return new Slide({
      voteResults: {
        results: event.results,
        completedBy: event.completedBy,
        confirmReq: event.eventDef?.input?.confirmReq ?? false,
      },
      title: { text: 'Vote Results' },
      subtitle: [`${event.eventName} event concluded`],
      order: ['title', 'voteResults', 'subtitle'],
    });
  }

  static playerUpdateWithGallery(
    playerId,
    voterIds,
    resolutionDesc = 'DESC NOT SET',
    showRole = false
  ) {
    console.log(voterIds);
    return new Slide({
      title: { text: 'Results' },
      playerUpdate: { playerId, desc: resolutionDesc, showRole },
      galleries: [{ playerIds: voterIds, header: 'VOTED FOR' }],
      order: ['title', 'playerUpdate', 'galleries[0]'],
    });
  }
}
