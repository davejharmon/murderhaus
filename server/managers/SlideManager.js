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

  push(slide) {
    const s = slide instanceof Slide ? slide : new Slide(slide);
    this._queue.push(s);

    // If queue was empty, show this slide immediately
    if (this._index === -1) {
      this._index = 0;
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
      active: this.current(), // current active slide
    };
  }

  _emitSlice() {
    if (!this.view) return;
    this.view.publishSlides(this.getSlice());
  }
}
