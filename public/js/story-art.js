// Original character art for story mode (inline SVG, 100x100).
const svg = (body) => `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">${body}</svg>`;

export const ART = {
  pip: svg(`
    <path d="M30 100 C 30 78, 52 80, 52 62" stroke="#5fe0a0" stroke-width="22" stroke-linecap="round" fill="none"/>
    <circle cx="54" cy="44" r="26" fill="#7cf0b4"/>
    <path d="M42 22 q 2 -12 -6 -15 M64 21 q 2 -12 11 -13" stroke="#3cb87a" stroke-width="3.5" fill="none" stroke-linecap="round"/>
    <circle cx="36" cy="7" r="3.5" fill="#ffd166"/><circle cx="75" cy="8" r="3.5" fill="#ffd166"/>
    <circle cx="44" cy="42" r="9" fill="#fff" stroke="#1d2a33" stroke-width="3"/>
    <circle cx="65" cy="42" r="9" fill="#fff" stroke="#1d2a33" stroke-width="3"/>
    <line x1="53" y1="42" x2="56" y2="42" stroke="#1d2a33" stroke-width="3"/>
    <circle cx="46" cy="43" r="3.5" fill="#1d2a33"/><circle cx="67" cy="43" r="3.5" fill="#1d2a33"/>
    <path d="M45 56 q 9 7 18 0" stroke="#1d2a33" stroke-width="3" fill="none" stroke-linecap="round"/>
    <circle cx="36" cy="54" r="3.5" fill="#ff8fa3" opacity=".6"/><circle cx="73" cy="54" r="3.5" fill="#ff8fa3" opacity=".6"/>`),

  narrator: svg(`
    <path d="M10 28 Q 30 20 50 30 Q 70 20 90 28 L 90 82 Q 70 74 50 84 Q 30 74 10 82 Z" fill="#f5ecd7" stroke="#cdbb94" stroke-width="3"/>
    <line x1="50" y1="30" x2="50" y2="84" stroke="#cdbb94" stroke-width="3"/>
    <g stroke="#b8a985" stroke-width="3" stroke-linecap="round">
      <line x1="20" y1="40" x2="42" y2="38"/><line x1="20" y1="50" x2="42" y2="48"/><line x1="20" y1="60" x2="36" y2="58"/>
      <line x1="58" y1="38" x2="80" y2="40"/><line x1="58" y1="48" x2="80" y2="50"/><line x1="58" y1="58" x2="74" y2="60"/>
    </g>`),

  puddle: svg(`
    <ellipse cx="50" cy="90" rx="38" ry="6" fill="rgba(0,0,0,.25)"/>
    <path d="M12 86 C 8 60, 24 34, 50 30 C 76 34, 92 60, 88 86 Z" fill="#4dabf7"/>
    <path d="M22 70 C 24 52, 34 42, 46 40" stroke="#a5d8ff" stroke-width="5" fill="none" stroke-linecap="round" opacity=".8"/>
    <path d="M50 30 C 46 20, 54 14, 50 6 C 58 14, 58 24, 50 30" fill="#4dabf7"/>
    <ellipse cx="38" cy="58" rx="8" ry="10" fill="#fff"/><ellipse cx="62" cy="58" rx="8" ry="10" fill="#fff"/>
    <circle cx="40" cy="61" r="4" fill="#123"/><circle cx="60" cy="61" r="4" fill="#123"/>
    <path d="M29 47 L 45 52 M71 47 L 55 52" stroke="#123" stroke-width="3.5" stroke-linecap="round"/>
    <path d="M34 74 Q 50 84 66 74 Z" fill="#123"/>
    <path d="M38 75 l 3 5 l 3 -4 l 3 5 l 3 -5 l 3 5 l 3 -4 l 3 4" stroke="#fff" stroke-width="2" fill="none"/>
    <circle cx="16" cy="94" r="3" fill="#4dabf7"/><circle cx="86" cy="95" r="2.5" fill="#4dabf7"/>`),

  crab: svg(`
    <ellipse cx="50" cy="92" rx="36" ry="5" fill="rgba(0,0,0,.25)"/>
    <g stroke="#c92a2a" stroke-width="5" stroke-linecap="round">
      <path d="M28 74 L 14 88 M34 78 L 24 92 M72 74 L 86 88 M66 78 L 76 92"/>
      <path d="M26 58 L 14 40 M74 58 L 86 40"/>
    </g>
    <path d="M6 34 C 4 20, 22 16, 24 30 L 18 30 C 18 24, 12 24, 12 30 Z" fill="#ff6b6b"/>
    <path d="M94 34 C 96 20, 78 16, 76 30 L 82 30 C 82 24, 88 24, 88 30 Z" fill="#ff6b6b"/>
    <ellipse cx="50" cy="66" rx="30" ry="20" fill="#ff6b6b"/>
    <path d="M28 62 Q 50 72 72 62" stroke="#e03131" stroke-width="3" fill="none"/>
    <line x1="40" y1="46" x2="38" y2="34" stroke="#c92a2a" stroke-width="4"/><line x1="60" y1="46" x2="62" y2="34" stroke="#c92a2a" stroke-width="4"/>
    <circle cx="38" cy="32" r="7" fill="#fff"/><circle cx="62" cy="32" r="7" fill="#fff"/>
    <circle cx="39" cy="33" r="3.5" fill="#123"/><circle cx="61" cy="33" r="3.5" fill="#123"/>
    <path d="M42 74 Q 50 70 58 74" stroke="#123" stroke-width="3" fill="none" stroke-linecap="round"/>
    <text x="8" y="14" font-size="13" font-weight="900" fill="#ffd166" font-family="sans-serif" transform="rotate(-15 8 14)">tpyo</text>`),

  gull: svg(`
    <ellipse cx="50" cy="94" rx="26" ry="4" fill="rgba(0,0,0,.25)"/>
    <path d="M50 40 C 24 40, 20 70, 32 86 L 68 86 C 80 70, 76 40, 50 40 Z" fill="#f8f9fa"/>
    <g stroke="#ced4da" stroke-width="2"><line x1="34" y1="58" x2="66" y2="58"/><line x1="32" y1="66" x2="68" y2="66"/><line x1="34" y1="74" x2="66" y2="74"/></g>
    <path d="M30 56 C 6 44, 4 70, 26 72 Z" fill="#dee2e6"/><path d="M70 56 C 94 44, 96 70, 74 72 Z" fill="#dee2e6"/>
    <circle cx="50" cy="32" r="18" fill="#f8f9fa"/>
    <circle cx="43" cy="28" r="5" fill="#fff" stroke="#123" stroke-width="2"/><circle cx="58" cy="28" r="5" fill="#fff" stroke="#123" stroke-width="2"/>
    <circle cx="44" cy="29" r="2.4" fill="#123"/><circle cx="57" cy="29" r="2.4" fill="#123"/>
    <path d="M38 21 L 47 24 M63 21 L 54 24" stroke="#123" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M44 36 L 68 40 L 46 46 Z" fill="#ffa94d"/><path d="M46 41 L 64 40" stroke="#e8590c" stroke-width="2"/>
    <path d="M42 86 l -4 6 M58 86 l 4 6" stroke="#ffa94d" stroke-width="3.5" stroke-linecap="round"/>
    <text x="70" y="22" font-size="12" font-weight="900" fill="#ffd166" font-family="sans-serif">!!</text>`),

  sogworth: svg(`
    <ellipse cx="50" cy="95" rx="40" ry="4" fill="rgba(0,0,0,.3)"/>
    <path d="M18 30 L 82 30 L 84 80 C 78 86, 74 78, 70 88 C 64 80, 58 92, 52 86 C 46 92, 40 80, 34 88 C 30 80, 24 88, 16 80 Z" fill="#d8ccb0"/>
    <path d="M18 30 L 82 30 L 84 80 C 78 86, 74 78, 70 88 C 64 80, 58 92, 52 86 C 46 92, 40 80, 34 88 C 30 80, 24 88, 16 80 Z" fill="url(#sogStain)" opacity=".7"/>
    <defs><radialGradient id="sogStain"><stop offset="0" stop-color="#7a9cc6"/><stop offset="1" stop-color="#7a9cc6" stop-opacity="0"/></radialGradient></defs>
    <g stroke="#a69a7c" stroke-width="2.5" stroke-linecap="round" opacity=".8"><line x1="26" y1="40" x2="60" y2="40"/><line x1="64" y1="40" x2="74" y2="40"/></g>
    <path d="M24 30 L 30 12 L 40 24 L 50 8 L 60 24 L 70 12 L 76 30 Z" fill="#ffd166" stroke="#c99528" stroke-width="2"/>
    <circle cx="50" cy="20" r="3" fill="#4dabf7"/>
    <ellipse cx="38" cy="54" rx="8" ry="7" fill="#fff"/><ellipse cx="62" cy="54" rx="8" ry="7" fill="#fff"/>
    <circle cx="39" cy="56" r="4" fill="#123"/><circle cx="61" cy="56" r="4" fill="#123"/>
    <path d="M27 44 L 46 49 M73 44 L 54 49" stroke="#123" stroke-width="4" stroke-linecap="round"/>
    <path d="M36 72 Q 50 64 64 72" stroke="#123" stroke-width="4" fill="none" stroke-linecap="round"/>
    <path d="M22 62 q -2 8 1 10 q 3 -2 -1 -10 M80 58 q -2 8 1 10 q 3 -2 -1 -10 M52 88 q -2 7 1 9 q 3 -2 -1 -9" fill="#4dabf7"/>`),
};

export const SPEAKERS = {
  pip: { name: 'Pip', art: 'pip' },
  narrator: { name: '', art: 'narrator' },
  puddle: { name: 'Puddle Pest', art: 'puddle' },
  crab: { name: 'Crabby Typo', art: 'crab' },
  gull: { name: 'Squawkington', art: 'gull' },
  sogworth: { name: 'Sogworth', art: 'sogworth' },
};
