export function assert(condition, message) {
  if (!condition) throw new Error(message);
}

export function clampInt(value, min, max) {
  return Math.max(min, Math.min(max, Math.trunc(value)));
}

export function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function randomInt(rng, min, max) {
  return Math.floor(rng() * (max - min + 1)) + min;
}

export function pick(rng, array) {
  assert(array.length > 0, "can't pick from an empty array.");
  return array[randomInt(rng, 0, array.length - 1)];
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character])
}