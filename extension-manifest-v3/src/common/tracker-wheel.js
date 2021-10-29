const CATEGORY_COLORS = {
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

const CATEGORY_ORDER = [
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

function degToRad(degree) {
  const factor = Math.PI / 180;
  return degree * factor;
}

function draw(ctx, categories) {
  // Group trackers by sorted category
  // (JavaScript objects will preserve the order)
  const groupedCategories = {};
  CATEGORY_ORDER.forEach(c => groupedCategories[c] = 0);
  categories.forEach(c => groupedCategories[c] += 1);

  const { canvas } = ctx;
  const { width } = canvas;
  const center = width / 2;
  const increment = 360 / categories.length;

  ctx.lineWidth = width * 0.14;
  const radius = width / 2 - ctx.lineWidth;

  let position = -90;
  for (const [category, numTrackers] of Object.entries(groupedCategories)) {
    if (numTrackers > 0) {
      const newPosition = position + numTrackers * increment;
      const color = CATEGORY_COLORS[category];
      ctx.strokeStyle = color;
      ctx.beginPath();
      ctx.arc(
        center,
        center,
        radius,
        degToRad(position),
        Math.min(degToRad(newPosition + 1), 2 * Math.PI),
      );
      ctx.stroke();
      position = newPosition;
    }
  }
}

function offscreenImageData(size, categories) {
  let canvas;
  try {
    canvas = new OffscreenCanvas(size, size);
  } catch (e) {
    canvas = document.createElement("canvas");
    canvas.setAttribute('height', size);
    canvas.setAttribute('width', size);
  }
  const ctx = canvas.getContext('2d');
  draw(ctx, categories);
  return ctx.getImageData(0, 0, size, size);
}
