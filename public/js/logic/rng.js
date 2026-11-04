// Small, fast, seedable random number generator (mulberry32).
// The state is a plain object so it can be saved with the game.

export function createRng(seed) {
  return { state: seed >>> 0 };
}

export function nextFloat(rng) {
  rng.state = (rng.state + 0x6d2b79f5) >>> 0;
  let t = rng.state;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

export function nextInt(rng, n) {
  return Math.floor(nextFloat(rng) * n);
}

export function pick(rng, arr) {
  return arr[nextInt(rng, arr.length)];
}

export function shuffleInPlace(rng, arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = nextInt(rng, i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function randomSeed() {
  return Math.floor(Math.random() * 4294967296) >>> 0;
}
