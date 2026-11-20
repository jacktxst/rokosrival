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

// picks a random subset of elements from an array
// always returns an array of picked elements
export function pick(array, maxMultiPick = 1, rng = Math.random) {
  assert(Array.isArray(array), `tried to Pick from a "${typeof array}"; expected an array but got "${array}"`);
  if (insist(array.length > 0, "Pick was called on an empty array")) return [];
  if (insist(maxMultiPick !== 0, "Pick was called with maxMultiPick equal to 0")) return [];

  // create a local copy of the array to avoid modifying the original array
  // ((it took me a while to realize you need to use array.slice() to create a copy and you can't just assign the array directly))
  let arrayCopy = array.slice();

  // negative maxMultiPick chooses which elements to leave unpicked,
  // then returns the remaining elements as the picked ones.
  if (maxMultiPick < 0) {
    const unpicked = pick(array, -maxMultiPick, rng);
    return array.filter(item => !unpicked.includes(item));
  }

  let result = [];
  const pickCount = randomInt(rng, 1, Math.min(maxMultiPick, array.length));
  
  // pick pickCount elements from the array randomly, ensuring no duplicates
  for (let i = 0; i < pickCount; i += 1) {
    const index = randomInt(rng, 0, arrayCopy.length - 1);
    result.push(arrayCopy[index]);
    arrayCopy.splice(index, 1);
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