// Story mode content: chapters, enemies and dialogue. Pure data.

export const PLAYER_MAX_HP = 60;
export const GLITCH_DAMAGE = 8; // damage when a glitch tile runs out in a battle
export const SNACK_HEAL = 25;

export const ENEMIES = {
  puddle: {
    id: 'puddle', name: 'Puddle Pest', art: 'puddle', hp: 90,
    weak: 'heat', resist: 'water',
    attack: { every: 3, damage: 7, effect: null },
    taunt: 'Blub blub! Your words will go all soggy!',
    defeat: 'Blub... I\'m... evaporating...',
  },
  crab: {
    id: 'crab', name: 'Crabby Typo', art: 'crab', hp: 140,
    weak: 'kitchen', resist: null,
    attack: { every: 3, damage: 6, effect: { type: 'glitch', count: 1, timer: 5 } },
    taunt: 'Snip snap! I pinch letters and leave typos behind!',
    defeat: 'Not the cooking pot! Anything but the pot!',
  },
  gull: {
    id: 'gull', name: 'Squawkington', art: 'gull', hp: 180,
    weak: 'sleep', resist: null,
    attack: { every: 3, damage: 8, effect: { type: 'scramble', count: 4 } },
    taunt: 'SQUAWK! I\'ll shuffle your letters while you\'re not looking!',
    defeat: 'Squaw... *yawn*... five more minutes...',
  },
  sogworth: {
    id: 'sogworth', name: 'Sogworth the Soggy', art: 'sogworth', hp: 260, boss: true,
    weak: 'heat', resist: 'water',
    attack: { every: 3, damage: 7, effect: { type: 'glitch', count: 1, timer: 6 } },
    enraged: { below: 0.4, every: 2, line: 'You dried my cloak! Now I\'m REALLY dripping mad!' },
    taunt: 'I am Sogworth, Lord of the Drip! This whole book will be pulp!',
    defeat: 'Nooo... my lovely damp... it\'s all... so... dry...',
  },
};

export const CHAPTERS = [
  {
    id: 'sea',
    title: 'Chapter 1: Tales of the Salty Sea',
    intro: [
      { who: 'narrator', text: 'Deep inside an old e-reader lives Pip, a bookworm who has read every book in the library. Twice.' },
      { who: 'pip', text: 'Huh? The pages are fuzzy... the letters are all jumbled up!' },
      { who: 'narrator', text: 'A crackling storm called the Static has broken into the library, scrambling every book it touches.' },
      { who: 'pip', text: 'Not on my watch! Words are my thing. Let\'s start with "Tales of the Salty Sea"... wait, why is it dripping?' },
    ],
    battles: [
      { enemy: 'puddle', reward: 'snack', before: [{ who: 'pip', text: 'A puddle with teeth? On page one?!' }] },
      { enemy: 'crab', reward: 'snack', before: [{ who: 'pip', text: 'That crab is snipping letters out of the sentences!' }] },
      { enemy: 'gull', reward: 'snack', before: [{ who: 'pip', text: 'Such a racket! If only it would take a little nap...' }] },
      {
        enemy: 'sogworth', reward: 'snack',
        before: [
          { who: 'pip', text: 'The pages are soaked through. Something big is making all this mess.' },
          { who: 'sogworth', text: 'Who dares squelch into MY book?' },
        ],
      },
    ],
    outro: [
      { who: 'narrator', text: 'Warm words fill the pages, and "Tales of the Salty Sea" dries out, crisp and readable once more.' },
      { who: 'pip', text: 'One book saved! But I can hear the Static crackling in the next one...' },
      { who: 'narrator', text: 'To be continued in Chapter 2. Coming soon!' },
    ],
  },
];

export function chapterById(id) {
  return CHAPTERS.find((c) => c.id === id);
}
