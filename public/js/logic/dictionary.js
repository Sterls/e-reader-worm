// Word checking. Words are stored lower-case, sorted, so we can do fast
// prefix checks with a binary search (used by the hint finder).

export const MIN_WORD = 3;
export const MAX_WORD = 15;
const ALPHABET = 'abcdefghijklmnopqrstuvwxyz';

export class Dictionary {
  constructor(words) {
    let sorted = true;
    for (let i = 1; i < words.length; i++) {
      if (words[i - 1] > words[i]) { sorted = false; break; }
    }
    this.words = sorted ? words : [...words].sort();
    this.set = new Set(this.words);
  }

  static fromText(text) {
    const words = text
      .split(/\r?\n/)
      .map((w) => w.trim().toLowerCase())
      .filter((w) => w.length >= MIN_WORD && w.length <= MAX_WORD && /^[a-z]+$/.test(w));
    return new Dictionary(words);
  }

  get size() {
    return this.words.length;
  }

  has(word) {
    return this.set.has(word.toLowerCase());
  }

  /** True if any word starts with this prefix. */
  hasPrefix(prefix) {
    const words = this.words;
    let lo = 0;
    let hi = words.length;
    while (lo < hi) {
      const mid = (lo + hi) >>> 1;
      if (words[mid] < prefix) lo = mid + 1;
      else hi = mid;
    }
    return lo < words.length && words[lo].startsWith(prefix);
  }

  /**
   * Finds a word matching a pattern where '?' stands for any letter.
   * Returns the word, or null if nothing matches.
   */
  match(pattern) {
    const p = pattern.toLowerCase();
    if (p.length < MIN_WORD || p.length > MAX_WORD) return null;
    if (!p.includes('?')) return this.set.has(p) ? p : null;
    const search = (i, prefix) => {
      if (i === p.length) return this.set.has(prefix) ? prefix : null;
      const ch = p[i];
      if (ch !== '?') {
        const next = prefix + ch;
        return this.hasPrefix(next) ? search(i + 1, next) : null;
      }
      for (const letter of ALPHABET) {
        const next = prefix + letter;
        if (!this.hasPrefix(next)) continue;
        const found = search(i + 1, next);
        if (found) return found;
      }
      return null;
    };
    return search(0, '');
  }
}
