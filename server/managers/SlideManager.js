import { Slide } from '../models/Slide.js';

export class SlideManager {
  constructor() {
    this._queue = [];
    this._index = -1;
    this.view = null; // injected ViewManager
  }

  init(viewManager) {
    this.view = viewManager;
  }

  push(slide, jumpTo = false) {
    const s = slide instanceof Slide ? slide : new Slide(slide);
    this._queue.push(s);

    const newIndex = this._queue.length - 1;

    if (this._index === -1) {
      // Queue was empty — default behaviour: show first slide
      this._index = 0;
    } else if (jumpTo) {
      // Explicit override: jump to the newly pushed slide
      this._index = newIndex;
    }

    this._emitSlice();
  }

  queueSlides(slides) {
    slides.forEach((s) => this.push(s));
  }

  replaceQueue(slides) {
    this._queue = slides.map((s) => (s instanceof Slide ? s : new Slide(s)));
    this._index = this._queue.length ? 0 : -1;
    this._emitSlice();
  }

  clear() {
    this._queue = [];
    this._index = -1;
    this._emitSlice();
  }

  next() {
    console.log(this._queue.length);
    if (!this._queue.length) return null;
    if (this._index < this._queue.length - 1) this._index++;
    this._emitSlice();
    return this.current();
  }

  current() {
    if (this._index === -1) return null;
    return this._queue[this._index] || null;
  }

  currentGalleries() {
    const slide = this.current();
    if (!slide) return [];
    return slide.galleries ?? (slide.gallery ? [slide.gallery] : []);
  }

  getSlice() {
    return {
      buffer: this._queue.slice(), // copy of the queue
      active: this._index,
    };
  }

  _emitSlice() {
    if (!this.view) return;
    this.view.publishSlides(this.getSlice());
  }
}
