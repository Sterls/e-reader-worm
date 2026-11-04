// Word themes for story battles: enemies take extra damage from words in their weak theme.
// Every word here is checked against the dictionary by the tests.

const LISTS = {
  heat: `sun suns sunny sunshine sunlight sunbeam sunburn sunbathe summer hot heat heated heater warm warmth
    fire fires fiery flame flames flaming blaze blazing burn burning burnt ember embers ash ashes smoke smoky
    spark sparks sparkle bake baking baker oven toast toasty roast grill grilled sizzle sizzling scorch scorching
    boil boiling steam steamy dry dried drying desert dune dunes sand sandy tropic tropical torch candle candles
    match matches stove kettle cook cooked chilli chili pepper spicy curry lava magma volcano solar sweat sweaty
    tan tanned glow glowing fever furnace kiln forge bonfire campfire fireplace barbecue sauna swelter
    sultry scald broil char charred cinder cinders hearth radiator blister blistering`,
  water: `water watery wet wetter soak soaked soggy damp moist rain rainy raindrop drizzle drip drips dripping
    puddle puddles pond lake river stream brook creek sea seas ocean oceans wave waves tide tides surf splash
    splashing spray flood flooded swim swimming dive diving drown float flow flowing pour pouring shower
    bath bathe soap tap sink fountain spring well dew mist misty foam bubble bubbles fish salt salty`,
  kitchen: `pot pots pan pans kettle cook cooking cooked chef stew soup broth boil boiling fry frying fried
    bake baked oven grill roast toast butter garlic lemon onion pepper salt sauce spice herbs ladle spoon fork
    knife plate bowl dish dinner lunch supper feast meal recipe kitchen stove simmer steam steamed saucepan
    skillet wok whisk sizzle crackle chop slice dice mince season seasoned peel grate stir mix bread pasta rice`,
  sleep: `sleep sleepy asleep slept nap naps napping doze dozing snooze snoozing dream dreams dreamy dreaming
    rest resting bed beds bedtime pillow pillows blanket duvet quilt cosy cozy hush quiet quietly calm calmly
    still silent silence peace peaceful night nights nightly moon moons moonlight star stars starry dusk yawn
    yawning slumber lullaby cradle drowsy drowse tired weary relax relaxed soothe soothing gentle soft softly
    snore snoring pajamas pyjamas slipper slippers rocking whisper whispers`,
};

export const THEMES = Object.fromEntries(
  Object.entries(LISTS).map(([name, text]) => [name, new Set(text.split(/\s+/).filter(Boolean))]),
);

export const THEME_LABELS = {
  heat: { name: 'Heat', icon: '☀', examples: ['SUN', 'BAKE', 'FIRE'] },
  water: { name: 'Water', icon: '💧', examples: ['RAIN', 'SEA', 'SPLASH'] },
  kitchen: { name: 'Kitchen', icon: '🍳', examples: ['POT', 'STEW', 'BOIL'] },
  sleep: { name: 'Sleepy', icon: '🌙', examples: ['NAP', 'HUSH', 'MOON'] },
};

/** Simple word endings so BAKES, BAKING, BAKED and BAKER all count as BAKE. */
function stems(word) {
  const w = word.toLowerCase();
  const out = new Set([w]);
  const add = (s) => { if (s.length >= 2) out.add(s); };
  if (w.endsWith('ies')) add(`${w.slice(0, -3)}y`);
  if (w.endsWith('es')) add(w.slice(0, -2));
  if (w.endsWith('s')) add(w.slice(0, -1));
  if (w.endsWith('ed')) { add(w.slice(0, -2)); add(w.slice(0, -1)); }
  if (w.endsWith('ing')) { add(w.slice(0, -3)); add(`${w.slice(0, -3)}e`); }
  if (w.endsWith('er')) { add(w.slice(0, -2)); add(w.slice(0, -1)); }
  if (w.endsWith('y')) add(w.slice(0, -1));
  // Doubled final consonant: SWIMMING -> SWIM, NAPPED -> NAP
  for (const s of [...out]) if (/([b-df-hj-np-tv-z])\1$/.test(s)) add(s.slice(0, -1));
  return out;
}

export function wordInTheme(word, theme) {
  const set = THEMES[theme];
  if (!set) return false;
  for (const s of stems(word)) if (set.has(s)) return true;
  return false;
}
