export function assert(condition, message) {
  if (!condition) throw new Error(`${message}!`);
}

export function insist(condition, message) {
  if (!condition) console.warn(`${message}...?`);
  return !condition;
}

export function clampInt(value, min, max) {
  return Math.max(min, Math.min(max, Math.trunc(value)));
}

export function capitalize(value) {
  assert(typeof value === "string", `tried to Capitalize a "${typeof value}"; expected a string but got "${value}"`);
  if (insist(value.length > 0, "Capitalize was called on an empty string")) return "";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function randomInt(rng, min, max) {
  return Math.floor(rng() * (max - min + 1)) + min;
}

export function pick(rng, array) {
  let maxMultiPick = 1; // TODO
  if (insist(array.length > 0, "Pick was called on an empty array")) return [];
  if (insist(maxMultiPick !== 0, "Pick was called with maxMultiPick equal to 0")) return [];

  // negative maxMultiPick chooses which elements to leave unpicked,
  // then returns the remaining elements as the picked ones.
  if (maxMultiPick < 0) {
    const unpicked = pick(rng, array);
    return array.filter(item => !unpicked.includes(item));
  }

  let result = [];
  const pickCount = randomInt(rng, 1, Math.min(maxMultiPick, array.length));
  
  for (let i = 0; i < pickCount; i += 1) {
    // pick a random element from the array, ensuring no duplicates
    const index = randomInt(rng, 0, array.length - 1);
    result.push(array[index]);
    array.splice(index, 1);
  }
  return result;
}

export function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character])
}