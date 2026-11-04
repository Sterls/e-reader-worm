// Connects the game rules, the board drawing, sounds and the menus.
import { Dictionary } from './logic/dictionary.js';
import * as Engine from './logic/engine.js';
import { hasAnyWord } from './logic/solver.js';
import { isAdjacent, samePos } from './logic/board.js';
import { goalText, isGoalDone } from './logic/levels.js';
import { praiseForLength } from './logic/scoring.js';
import { BoardView } from './render.js';
import { Confetti } from './fx.js';
import { Sound, vibrate } from './audio.js';
import { store } from './storage.js';
import { Ads } from './ads.js';
import { THEMES, THEME_ORDER } from './themes.js';

const $ = (id) => document.getElementById(id);
const fmt = (n) => Math.round(n).toLocaleString('en-GB');

const settings = { sound: true, haptics: true, theme: 'ink', seenHowTo: false, ...store.get('settings', {}) };
const best = { score: 0, level: 0, word: '', ...store.get('best', {}) };
const sound = new Sound();
sound.enabled = settings.sound;
const view = new BoardView($('board'));
const confetti = new Confetti($('fx'));

let dict = null;
let state = null;
let path = [];
let preview = null;
let drag = null;
let displayedScore = 0;
let scoreAnim = null;
let doneGoals = new Set();
let pendingTimer = null;

const HEART = '<svg viewBox="0 0 24 24"><path d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 3 4.5 6.7 4.5c2.1 0 3.6 1.2 4.3 2.4.7-1.2 2.2-2.4 4.3-2.4 3.7 0 5.8 3.9 4.3 7.3C19.5 16.4 12 21 12 21z" fill="#ff4d6d" stroke="#7a0f25" stroke-width="1.2"/></svg>';
const SOUND_ON = '<svg viewBox="0 0 24 24" width="22" height="22"><path d="M4 9v6h4l5 4V5L8 9H4zM16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const SOUND_OFF = '<svg viewBox="0 0 24 24" width="22" height="22"><path d="M4 9v6h4l5 4V5L8 9H4zM17 9l5 6M22 9l-5 6" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>';

// ---------- Settings and theme ----------
function saveSettings() {
  store.set('settings', settings);
}

function applyTheme() {
  document.body.dataset.theme = settings.theme;
  view.setTheme(settings.theme);
  const bg = getComputedStyle(document.body).getPropertyValue('--bg').trim();
  document.querySelector('meta[name="theme-color"]').setAttribute('content', bg || '#10202a');
}

function setSound(on, { unlock = true } = {}) {
  settings.sound = on;
  sound.enabled = on;
  if (on && unlock) sound.unlock();
  saveSettings();
  $('titleSoundBtn').innerHTML = on ? SOUND_ON : SOUND_OFF;
}

// ---------- Screens ----------
function showScreen(id) {
  document.querySelectorAll('.screen').forEach((s) => s.classList.toggle('active', s.id === id));
  if (id === 'game') requestAnimationFrame(layout);
}

function savedGame() {
  const s = store.get('save');
  return s && s.version === Engine.SAVE_VERSION && !s.gameOver ? s : null;
}

function updateTitle() {
  $('bestLine').innerHTML = best.score
    ? `Best <b>${fmt(best.score)}</b> &middot; Level ${best.level}`
    : 'Make words. Squash glitches. Grow!';
  $('continueBtn').hidden = !savedGame();
  $('playBtn').classList.toggle('primary', !savedGame());
}

// ---------- Modal ----------
let modalBack = null;

/** onBack: what the Android back button does while this window is open (null = nothing). */
function showModal(html, actions = {}, onBack = null) {
  modalBack = onBack;
  const card = $('modalCard');
  card.innerHTML = html;
  card.querySelectorAll('[data-action]').forEach((btn) => {
    btn.addEventListener('click', () => {
      sound.click();
      actions[btn.dataset.action]?.(btn);
    });
  });
  $('modal').hidden = false;
}

function closeModal() {
  modalBack = null;
  $('modal').hidden = true;
  $('modalCard').innerHTML = '';
}

function modalOpen() {
  return !$('modal').hidden;
}

const HOW_TO = `
  <h2>How to play</h2>
  <ul class="how">
    <li><span class="chip paper">A</span><span><b>Swipe across touching letters</b> (diagonals count) to spell a word of 3 or more letters, then let go. You can also tap letters one by one and tap the last one again.</span></li>
    <li><span class="chip paper">Z</span><span><b>Long words and rare letters</b> score far more. A 7-letter word is worth about 10 three-letter words.</span></li>
    <li><span class="chip gold">×2</span><span><b>Bonus tiles:</b> 5 letters earns a gold tile (×2).</span></li>
    <li><span class="chip wild">?</span><span>6 letters earns a wild tile (any letter).</span></li>
    <li><span class="chip crystal">×3</span><span>7 letters earns a crystal tile (×3).</span></li>
    <li><span class="chip bolt">⚡</span><span>8+ letters earns a bolt tile, which clears its whole row.</span></li>
    <li><span class="chip glitch">5</span><span><b>Glitch tiles</b> count down after every word. Use them in a word before they hit 0, or you lose a heart. Lose all 3 and the game is over.</span></li>
    <li><span class="chip paper">✓</span><span><b>Finish the goals</b> at the top to clear the level. Each level gives back a heart, a shuffle and a hint.</span></li>
  </ul>`;

function showHowTo(onClose) {
  const ok = () => {
    closeModal();
    settings.seenHowTo = true;
    saveSettings();
    onClose?.();
  };
  showModal(`${HOW_TO}<div class="actions"><button class="btn primary" data-action="ok">Got it</button></div>`, { ok }, ok);
}

function showCredits() {
  showModal(`
    <h2>Credits</h2>
    <p><b>E-Reader Worm</b> is an original word game.</p>
    <p>Word list: <b>ENABLE</b> (Enhanced North American Benchmark Lexicon), which is in the public domain.</p>
    <p>All sounds are generated in code. Fonts are your device's own.</p>
    <p>${Ads.isAvailable() || window.Capacitor?.isNativePlatform?.()
      ? 'The app shows optional video ads only when you choose to watch one. See the privacy policy at the game\'s website.'
      : 'This web version has no ads and no tracking.'} Your scores are saved only on this device.</p>
    <div class="actions"><button class="btn primary" data-action="ok">Close</button></div>`, { ok: closeModal }, closeModal);
}

// ---------- HUD ----------
function animateScore(target) {
  const from = displayedScore;
  const start = performance.now();
  cancelAnimationFrame(scoreAnim);
  const step = (now) => {
    const p = Math.min(1, (now - start) / 550);
    displayedScore = from + (target - from) * (1 - (1 - p) ** 3);
    $('scoreText').textContent = fmt(displayedScore);
    if (p < 1) scoreAnim = requestAnimationFrame(step);
  };
  scoreAnim = requestAnimationFrame(step);
  if (target > from) {
    const el = $('scoreText');
    el.classList.remove('bump');
    void el.offsetWidth;
    el.classList.add('bump');
  }
}

function renderHearts() {
  $('hearts').innerHTML = Array.from({ length: Engine.MAX_HEARTS }, (_, i) =>
    HEART.replace('<svg', `<svg class="${i < state.hearts ? '' : 'lost'}"`)).join('');
}

function renderGoals() {
  $('goals').innerHTML = state.goals.map((g, i) => {
    const done = isGoalDone(g);
    const key = `${state.level}:${i}`;
    const just = done && !doneGoals.has(key);
    if (done) doneGoals.add(key);
    const count = g.type === 'score' ? `${fmt(g.progress)} / ${fmt(g.target)}` : done ? 'Done!' : `${g.progress} / ${g.target}`;
    return `<div class="goal ${done ? 'done' : ''} ${just ? 'just-done' : ''}">
      <span class="label">${done ? '✓ ' : ''}${goalText(g)}</span>
      <span class="count">${count}</span>
      <div class="bar"><i style="width:${(100 * g.progress) / g.target}%"></i></div>
    </div>`;
  }).join('');
}

function renderHud({ instantScore = false } = {}) {
  $('levelText').textContent = `Level ${state.level}`;
  if (instantScore) {
    displayedScore = state.score;
    $('scoreText').textContent = fmt(state.score);
  } else if (Math.round(displayedScore) !== state.score) {
    animateScore(state.score);
  }
  renderHearts();
  renderGoals();
  $('shuffleCount').textContent = state.shuffles;
  $('hintCount').textContent = state.hints;
  renderWordBar();
}

function renderWordBar() {
  const bar = $('wordBar');
  const text = $('wordText');
  if (!path.length) {
    text.textContent = 'Swipe across letters to make a word';
    text.classList.add('placeholder');
    $('wordScore').textContent = '';
    bar.classList.remove('valid');
    $('clearBtn').hidden = true;
    return;
  }
  text.classList.remove('placeholder');
  const letters = path.map(([r, c]) => state.board[r][c].letter).join('');
  text.textContent = preview?.valid ? preview.word.toUpperCase() : letters.toUpperCase();
  $('wordScore').textContent = preview?.valid ? `+${fmt(preview.points)}` : '';
  bar.classList.toggle('valid', !!preview?.valid);
  $('clearBtn').hidden = false;
}

function showBanner(text, small = '', kind = '') {
  const el = $('banner');
  el.className = 'banner';
  el.innerHTML = `${text}${small ? `<small>${small}</small>` : ''}`;
  void el.offsetWidth;
  el.className = `banner show ${kind}`;
}

function layout() {
  const wrap = $('boardWrap');
  if (!wrap.clientWidth) return;
  view.resize(wrap.clientWidth, wrap.clientHeight);
}

// ---------- Selecting letters ----------
function canPlay() {
  return state && dict && !state.gameOver && !state.levelComplete && !modalOpen() && $('game').classList.contains('active');
}

function indexInPath(cell) {
  return path.findIndex((p) => samePos(p, cell));
}

function addToPath(cell) {
  path.push(cell);
  sound.select(path.length - 1);
  vibrate(settings.haptics, 8);
}

function updateSelection() {
  preview = path.length ? Engine.evaluatePath(state, dict, path) : null;
  view.setSelection(path, !!preview?.valid);
  renderWordBar();
}

function clearSelection() {
  path = [];
  updateSelection();
}

function onPointerDown(e) {
  if (!canPlay()) return;
  sound.unlock();
  const cell = view.cellAt(e.clientX, e.clientY);
  if (!cell) return;
  e.preventDefault();
  try { e.target.setPointerCapture(e.pointerId); } catch { /* ignore */ }
  view.clearHint();
  drag = { id: e.pointerId, moved: false, submitOnUp: false };
  const idx = indexInPath(cell);
  if (path.length && idx === path.length - 1) {
    drag.submitOnUp = path.length >= 3;
  } else if (idx >= 0) {
    path = path.slice(0, idx + 1);
    sound.deselect();
  } else if (path.length && isAdjacent(path[path.length - 1], cell)) {
    addToPath(cell);
  } else {
    path = [];
    addToPath(cell);
  }
  updateSelection();
}

function onPointerMove(e) {
  if (!drag || e.pointerId !== drag.id || !canPlay()) return;
  const cell = view.cellAt(e.clientX, e.clientY, true);
  if (!cell) return;
  const last = path[path.length - 1];
  if (last && samePos(last, cell)) return;
  if (path.length >= 2 && samePos(path[path.length - 2], cell)) {
    path.pop();
    drag.moved = true;
    drag.submitOnUp = false;
    sound.deselect();
    updateSelection();
    return;
  }
  if (indexInPath(cell) >= 0) return;
  if (last && isAdjacent(last, cell)) {
    addToPath(cell);
    drag.moved = true;
    drag.submitOnUp = false;
    updateSelection();
  }
}

function onPointerUp(e) {
  if (!drag || e.pointerId !== drag.id) return;
  const d = drag;
  drag = null;
  if (e.type === 'pointercancel' || !canPlay()) return;
  if ((d.moved && path.length >= 3) || d.submitOnUp) submit();
}

// ---------- Playing a word ----------
function centroid(cells) {
  const r = cells.reduce((s, p) => s + p[0], 0) / cells.length;
  const c = cells.reduce((s, p) => s + p[1], 0) / cells.length;
  return [r, c];
}

function submit() {
  if (!canPlay() || !path.length) return;
  const played = path;
  const res = Engine.submitWord(state, dict, played);
  if (!res.ok) {
    const bar = $('wordBar');
    bar.classList.remove('bad');
    void bar.offsetWidth;
    bar.classList.add('bad');
    sound.invalid();
    vibrate(settings.haptics, [20, 40, 20]);
    view.shakeBoard(0.35);
    setTimeout(() => bar.classList.remove('bad'), 400);
    clearSelection();
    return;
  }
  path = [];
  preview = null;
  view.setSelection([], false);
  const before = new Set(view.views.keys());
  handleEvents(res.events, played);
  view.sync(state.board);
  for (const v of view.views.values()) {
    if (!before.has(v.id) && v.kind !== 'normal' && v.kind !== 'glitch') {
      const colour = v.kind === 'gold' ? '#ffd166' : v.kind === 'crystal' ? '#9ff0ff' : '#ffffff';
      setTimeout(() => view.ring(v.ty, v.tx, colour), 350);
    }
  }
  renderHud();
  saveGame();

  clearTimeout(pendingTimer);
  if (state.gameOver) pendingTimer = setTimeout(showGameOver, 1100);
  else if (state.levelComplete) pendingTimer = setTimeout(showLevelComplete, 900);
  else pendingTimer = setTimeout(checkStuck, 700);
}

function handleEvents(events, played) {
  let heartLost = false;
  for (const ev of events) {
    switch (ev.type) {
      case 'word': {
        const big = ev.length >= 6;
        view.pop(ev.ids, { big });
        const [r, c] = centroid(played);
        view.floatText(`+${fmt(ev.points)}`, r, c, { size: big ? 0.8 : 0.62, colour: ev.length >= 5 ? '#ffd166' : '#ffffff' });
        sound.word(ev.length);
        vibrate(settings.haptics, big ? [15, 30, 25] : 15);
        const praise = praiseForLength(ev.length);
        if (praise) showBanner(praise, ev.streak >= 2 ? `Streak ×${ev.streak}` : ev.word.toUpperCase());
        if (ev.length >= 6) view.shakeBoard(ev.length >= 8 ? 1 : 0.5);
        if (ev.length >= 7) confetti.burst(ev.length >= 8 ? 120 : 60);
        break;
      }
      case 'bolt':
        view.rowFlash(ev.row);
        sound.bolt();
        view.shakeBoard(0.8);
        break;
      case 'cleared':
        view.pop([ev.id], { delayStep: 0 });
        break;
      case 'goal':
        setTimeout(() => sound.goal(), 250);
        break;
      case 'reward':
        sound.reward();
        break;
      case 'glitchExpired':
        heartLost = true;
        view.pop([ev.id], { big: true });
        sound.glitch();
        view.shakeBoard(1);
        vibrate(settings.haptics, [60, 40, 60]);
        break;
      default:
        break;
    }
  }
  if (heartLost) {
    const v = $('vignette');
    v.classList.remove('flash');
    void v.offsetWidth;
    v.classList.add('flash');
    const h = $('hearts');
    h.classList.remove('hit');
    void h.offsetWidth;
    h.classList.add('hit');
    if (!state.gameOver) showBanner('Glitch!', 'You lost a heart', 'danger');
  }
}

function checkStuck() {
  if (!canPlay()) return;
  if (!hasAnyWord(state.board, dict)) {
    Engine.rerollLetters(state);
    view.sync(state.board);
    showBanner('No words left!', 'Fresh letters, on the house', 'info');
    saveGame();
  }
}

// ---------- Power-ups ----------
/** Shows a rewarded video. Game sounds pause while it plays. */
async function watchAd() {
  sound.suspend();
  const ok = await Ads.showRewarded();
  if (settings.sound) sound.unlock();
  if (!ok) showBanner('No video right now', 'Please try again later', 'info');
  return ok;
}

function offerAd(what, give) {
  if (!Ads.isAvailable()) {
    showBanner(`No ${what}s left`, 'Clear a level to earn more', 'info');
    return;
  }
  showModal(`<h2>Out of ${what}s</h2><p>Watch a short video to get 2 more?</p>
    <div class="actions"><button class="btn gold" data-action="watch">Watch video</button>
    <button class="btn" data-action="no">No thanks</button></div>`, {
    watch: async () => {
      closeModal();
      if (await watchAd()) {
        give();
        renderHud();
        saveGame();
        sound.reward();
        showBanner(`+2 ${what}s`, 'Thanks for watching!', 'info');
      }
    },
    no: closeModal,
  }, closeModal);
}

function onShuffle() {
  if (!canPlay()) return;
  sound.unlock();
  if (state.shuffles <= 0) return offerAd('shuffle', () => { state.shuffles += 2; });
  const res = Engine.useShuffle(state);
  if (!res.ok) return;
  clearSelection();
  view.clearHint();
  view.sync(state.board);
  view.shakeBoard(0.3);
  sound.noise({ dur: 0.25, vol: 0.2, freq: 1800, q: 0.7 });
  sound.reward();
  renderHud();
  saveGame();
  pendingTimer = setTimeout(checkStuck, 400);
}

function onHint() {
  if (!canPlay()) return;
  sound.unlock();
  if (state.hints <= 0) return offerAd('hint', () => { state.hints += 2; });
  const res = Engine.useHint(state, dict);
  if (!res.ok) { checkStuck(); return; }
  clearSelection();
  view.showHint(res.path);
  sound.goal();
  renderHud();
  saveGame();
}

// ---------- Level complete / game over ----------
function updateBest() {
  let newBest = false;
  if (state.score > best.score) { best.score = state.score; newBest = true; }
  best.level = Math.max(best.level, state.level);
  if (state.stats.longest.length > best.word.length) best.word = state.stats.longest;
  store.set('best', best);
  return newBest;
}

function showLevelComplete() {
  if (!state.levelComplete) return;
  sound.levelUp();
  confetti.burst(160);
  vibrate(settings.haptics, [30, 50, 30, 50, 60]);
  const bonus = 100 * state.level;
  showModal(`
    <h2>Level ${state.level} clear!</h2>
    <p>Level bonus</p>
    <div class="big-number">+${fmt(bonus)}</div>
    <div class="stats">
      <span>Score</span><span>${fmt(state.score + bonus)}</span>
      <span>Best word</span><span>${state.stats.bestWord.toUpperCase() || '-'}</span>
      <span>Next level</span><span>+1 heart, shuffle, hint</span>
    </div>
    <div class="actions"><button class="btn primary" data-action="next">Next level</button></div>`, {
    next: () => {
      closeModal();
      Engine.startNextLevel(state);
      updateBest();
      renderHud();
      saveGame();
      showBanner(`Level ${state.level}`, state.level === 2 ? 'Watch out for glitch tiles!' : 'Here we go!', 'info');
      pendingTimer = setTimeout(checkStuck, 300);
    },
  });
}

function showGameOver() {
  sound.gameOver();
  const newBest = updateBest();
  store.remove('save');
  const canRevive = Ads.isAvailable() && !state.revived;
  showModal(`
    <h2>Out of hearts</h2>
    ${newBest ? '<p class="new-best">NEW BEST SCORE!</p>' : ''}
    <div class="big-number">${fmt(state.score)}</div>
    <div class="stats">
      <span>Level reached</span><span>${state.level}</span>
      <span>Words made</span><span>${state.stats.words}</span>
      <span>Longest word</span><span>${state.stats.longest.toUpperCase() || '-'}</span>
      <span>Best word</span><span>${state.stats.bestWord ? `${state.stats.bestWord.toUpperCase()} (${fmt(state.stats.bestPoints)})` : '-'}</span>
      <span>Best ever</span><span>${fmt(best.score)}</span>
    </div>
    <div class="actions">
      ${canRevive ? '<button class="btn gold" data-action="revive">Watch a video to keep going</button>' : ''}
      <button class="btn primary" data-action="again">Play again</button>
      <button class="btn" data-action="menu">Main menu</button>
    </div>`, {
    revive: async () => {
      if (await watchAd()) {
        Engine.revive(state);
        state.revived = true;
        closeModal();
        view.sync(state.board);
        renderHud();
        saveGame();
      }
    },
    again: () => { closeModal(); startGame(Engine.newGame()); },
    menu: () => { closeModal(); updateTitle(); showScreen('title'); },
  }, () => { closeModal(); updateTitle(); showScreen('title'); });
}

function showPause() {
  if (modalOpen()) return;
  const themeName = THEMES[settings.theme]?.name || 'Ink';
  const hasVibrate = 'vibrate' in navigator;
  showModal(`
    <h2>Paused</h2>
    <div class="setting-row"><span>Sound</span><button class="toggle ${settings.sound ? 'on' : ''}" data-action="sound">${settings.sound ? 'On' : 'Off'}</button></div>
    ${hasVibrate ? `<div class="setting-row"><span>Vibration</span><button class="toggle ${settings.haptics ? 'on' : ''}" data-action="haptics">${settings.haptics ? 'On' : 'Off'}</button></div>` : ''}
    <div class="setting-row"><span>Theme</span><button class="toggle on" data-action="theme">${themeName}</button></div>
    <div class="actions">
      <button class="btn primary" data-action="resume">Resume</button>
      <button class="btn" data-action="how">How to play</button>
      ${Ads.hasPrivacyOptions() ? '<button class="btn" data-action="privacy">Privacy settings</button>' : ''}
      <button class="btn" data-action="restart">New game</button>
      <button class="btn" data-action="menu">Main menu</button>
    </div>`, {
    sound: (btn) => {
      setSound(!settings.sound);
      btn.classList.toggle('on', settings.sound);
      btn.textContent = settings.sound ? 'On' : 'Off';
    },
    haptics: (btn) => {
      settings.haptics = !settings.haptics;
      saveSettings();
      btn.classList.toggle('on', settings.haptics);
      btn.textContent = settings.haptics ? 'On' : 'Off';
      vibrate(settings.haptics, 20);
    },
    theme: (btn) => {
      const i = THEME_ORDER.indexOf(settings.theme);
      const next = THEME_ORDER[(i + 1) % THEME_ORDER.length];
      if (!themeUnlocked(next)) { offerTheme(next); return; }
      settings.theme = next;
      saveSettings();
      applyTheme();
      btn.textContent = THEMES[settings.theme].name;
    },
    privacy: () => Ads.showPrivacyOptions(),
    resume: closeModal,
    how: () => showHowTo(showPause),
    restart: () => {
      showModal(`<h2>Start again?</h2><p>Your current game will be lost.</p>
        <div class="actions"><button class="btn primary" data-action="yes">Yes, new game</button>
        <button class="btn" data-action="no">Cancel</button></div>`, {
        yes: () => { closeModal(); updateBest(); startGame(Engine.newGame()); },
        no: () => { closeModal(); showPause(); },
      }, () => { closeModal(); showPause(); });
    },
    menu: () => { closeModal(); saveGame(); updateTitle(); showScreen('title'); },
  }, closeModal);
}

// Extra colour themes are free on the web. In the app they unlock by watching one video
// (or are free if videos aren't available, so nobody is ever stuck).
function themeUnlocked(name) {
  return name === 'ink' || !Ads.isAvailable() || (settings.unlockedThemes || []).includes(name);
}

function offerTheme(name) {
  const label = THEMES[name].name;
  showModal(`<h2>${label} theme</h2><p>Watch a short video to unlock the ${label} theme for good?</p>
    <div class="actions"><button class="btn gold" data-action="watch">Watch video</button>
    <button class="btn" data-action="skip">Skip this theme</button></div>`, {
    watch: async () => {
      closeModal();
      if (await watchAd()) {
        settings.unlockedThemes = [...(settings.unlockedThemes || []), name];
        settings.theme = name;
        saveSettings();
        applyTheme();
        sound.reward();
      }
      showPause();
    },
    skip: () => {
      const i = THEME_ORDER.indexOf(name);
      const after = THEME_ORDER.slice(i + 1).find(themeUnlocked) || 'ink';
      settings.theme = after;
      saveSettings();
      applyTheme();
      closeModal();
      showPause();
    },
  }, () => { closeModal(); showPause(); });
}

// ---------- Android back button ----------
function onBack(App) {
  if (modalOpen()) {
    if (modalBack) modalBack();
    return;
  }
  if ($('game').classList.contains('active')) {
    if (path.length) clearSelection();
    else showPause();
    return;
  }
  App?.exitApp?.();
}

function setUpNative() {
  if (!window.Capacitor?.isNativePlatform?.()) return;
  const App = window.Capacitor.registerPlugin('App');
  App.addListener('backButton', () => onBack(App));
  App.addListener('pause', () => { sound.suspend(); saveGame(); });
  App.addListener('resume', () => { if (settings.sound) sound.unlock(); });
  Ads.init();
}

// ---------- Game lifecycle ----------
function saveGame() {
  if (state && !state.gameOver) store.set('save', state);
}

function startGame(newState) {
  clearTimeout(pendingTimer);
  state = newState;
  path = [];
  preview = null;
  doneGoals = new Set();
  state.goals.forEach((g, i) => { if (isGoalDone(g)) doneGoals.add(`${state.level}:${i}`); });
  view.views.clear();
  view.effects = [];
  view.clearHint();
  showScreen('game');
  layout();
  view.sync(state.board);
  view.setSelection([], false);
  renderHud({ instantScore: true });
  saveGame();
  if (state.levelComplete) pendingTimer = setTimeout(showLevelComplete, 500);
  else pendingTimer = setTimeout(checkStuck, 900);
}

function loop() {
  let last = performance.now();
  const frame = (now) => {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if ($('game').classList.contains('active') && (view.dirty || view.isBusy() || view.needsContinuousDraw())) {
      view.update(dt);
      view.draw();
    }
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}

async function loadWords() {
  const btn = $('playBtn');
  btn.disabled = true;
  $('continueBtn').disabled = true;
  btn.textContent = 'Loading words…';
  try {
    const res = await fetch('words.txt');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    dict = Dictionary.fromText(await res.text());
    btn.disabled = false;
    btn.textContent = 'New game';
    $('continueBtn').disabled = false;
  } catch (err) {
    console.error(err);
    btn.disabled = false;
    btn.textContent = 'Could not load words. Tap to retry';
    btn.dataset.retry = '1';
  }
}

function init() {
  applyTheme();
  setSound(settings.sound, { unlock: false });
  updateTitle();

  const canvas = $('board');
  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('pointercancel', onPointerUp);
  canvas.addEventListener('contextmenu', (e) => e.preventDefault());

  $('playBtn').addEventListener('click', () => {
    sound.unlock();
    if ($('playBtn').dataset.retry) { delete $('playBtn').dataset.retry; loadWords(); return; }
    if (!dict) return;
    sound.click();
    const go = () => startGame(Engine.newGame());
    if (savedGame()) {
      showModal(`<h2>New game?</h2><p>This will replace your saved game.</p>
        <div class="actions"><button class="btn primary" data-action="yes">Start new game</button>
        <button class="btn" data-action="no">Cancel</button></div>`, { yes: () => { closeModal(); go(); }, no: closeModal }, closeModal);
    } else if (!settings.seenHowTo) {
      showHowTo(go);
    } else go();
  });
  $('continueBtn').addEventListener('click', () => {
    sound.unlock();
    sound.click();
    const s = savedGame();
    if (s && dict) startGame(s);
  });
  $('howBtn').addEventListener('click', () => { sound.unlock(); sound.click(); showHowTo(); });
  $('creditsBtn').addEventListener('click', () => { sound.click(); showCredits(); });
  $('titleSoundBtn').addEventListener('click', () => { setSound(!settings.sound); sound.click(); });
  $('pauseBtn').addEventListener('click', () => { sound.click(); showPause(); });
  $('shuffleBtn').addEventListener('click', onShuffle);
  $('hintBtn').addEventListener('click', onHint);
  $('clearBtn').addEventListener('click', () => { sound.deselect(); clearSelection(); });
  $('wordBar').addEventListener('click', (e) => {
    if (e.target.closest('#clearBtn')) return;
    if (preview?.valid) submit();
  });

  new ResizeObserver(layout).observe($('boardWrap'));
  window.addEventListener('resize', layout);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { sound.suspend(); saveGame(); }
  });
  window.addEventListener('pagehide', saveGame);

  if (new URLSearchParams(location.search).has('debug')) {
    window.__erw = {
      get state() { return state; },
      get dict() { return dict; },
      view,
      refresh() { view.sync(state.board, { instant: true }); renderHud({ instantScore: true }); },
    };
  }

  setUpNative();
  loop();
  loadWords();
}

init();
