/**
 * Ghostery Browser Extension
 * https://www.ghostery.com/
 *
 * Copyright 2017-present Ghostery GmbH. All rights reserved.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0
 */

class WTMTrackerWheel {
  static draw(ctx, size, categories) {
    // Group trackers by sorted category
    // (JavaScript objects will preserve the order)
    const groupedCategories = {};
    this.CATEGORY_ORDER.forEach((c) => (groupedCategories[c] = 0));
    categories.forEach((c) => (groupedCategories[c] += 1));

    const center = size / 2;
    const increment = 360 / categories.length;

    /* Background START */
    // This special blue background is required for Desktop Safari to render the colors property
    // We've tried: white, black, red and transparent - non of those works
    // Line width has to be a little bit smaller than the final arc so it blue wont be visible on dithered edges.
    // Line width cannot be too small as otherwise Safari will render the colors incorrectly.
    // Number below were chosen by trial end error.
    ctx.lineWidth = Math.floor(size * 0.14) * 0.95;
    const radius = size / 2 - ctx.lineWidth;
    ctx.strokeStyle = 'blue';
    ctx.beginPath();
    ctx.arc(center, center, Math.floor(radius), 0, 2 * Math.PI);
    ctx.stroke();
    /* Background END */

    ctx.lineWidth = size * 0.14;
    let position = -90;
    for (const [category, numTrackers] of Object.entries(groupedCategories)) {
      if (numTrackers > 0) {
        const newPosition = position + numTrackers * increment;
        const color = this.CATEGORY_COLORS[category];
        ctx.strokeStyle = color;
        ctx.beginPath();
        ctx.arc(
          center,
          center,
          radius,
          this._degToRad(position),
          Math.min(this._degToRad(newPosition + 1), 2 * Math.PI),
        );
        ctx.stroke();
        position = newPosition;
      }
    }
  }

  static offscreenImageData(size, categories) {
    let canvas;
    try {
      canvas = new OffscreenCanvas(size, size);
    } catch (e) {
      canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
    }
    const ctx = canvas.getContext('2d');
    this.draw(ctx, size, categories);
    return ctx.getImageData(0, 0, size, size);
  }

  static _degToRad(degree) {
    const factor = Math.PI / 180;
    return degree * factor;
  }

  static setupCtx(ctx, size) {
    const { canvas } = ctx;

    canvas.style.width = size + 'px';
    canvas.style.height = size + 'px';

    // Set actual size in memory (scaled to account for extra pixel density).
    const scale = window.devicePixelRatio;
    canvas.width = Math.floor(size * scale);
    canvas.height = Math.floor(size * scale);

    // Normalize coordinate system to use css pixels.
    ctx.scale(scale, scale);
  }
}

WTMTrackerWheel.CATEGORY_COLORS = {
  advertising: '#cb55cd',
  audio_video_player: '#ef671e',
  cdn: '#43b7c5',
  customer_interaction: '#fdc257',
  essential: '#fc9734',
  misc: '#ecafc2',
  site_analytics: '#87d7ef',
  social_media: '#388ee8',
  hosting: '#e8e8e8',
  pornvertising: '#fb5b8b',
  extensions: '#e2e781',
  comments: '#b0a8ff',
  unknown: '#959595',
  default: '#ffffff30',
  no_tracker: '#94c59e',
};

WTMTrackerWheel.CATEGORY_ORDER = [
  'advertising',
  'site_analytics',
  'cdn',
  'audio_video_player',
  'misc',
  'essential',
  'social_media',
  'hosting',
  'customer_interaction',
  'pornvertising',
  'extensions',
  'comments',
  'unknown',
];
