// Draws the board on a <canvas> and runs all the board animations.
import { COLS, ROWS } from './logic/board.js';
import { letterValue } from './logic/letters.js';
import { THEMES } from './themes.js';

const FONT = 'ui-rounded, "SF Pro Rounded", "Nunito", "Varela Round", "Segoe UI", system-ui, sans-serif';
const GRAVITY = 46; // cells per second squared
const KIND_COLOURS = {
  normal: ['#f5ecd7', '#e2d3ae', '#fff6dd'],
  gold: ['#ffd166', '#f4a623', '#fff1b8'],
  crystal: ['#9ff0ff', '#8aa8ff', '#e6fbff'],
  wild: ['#ff6b6b', '#ffd166', '#3ddc97', '#4dabf7', '#b197fc'],
  bolt: ['#ffd166', '#fff3c4', '#ffb703'],
  glitch: ['#ff3d6e', '#7c2cff', '#00e5ff'],
};

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export class BoardView {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.views = new Map();
    this.effects = [];
    this.selection = [];
    this.selectionValid = false;
    this.hint = null;
    this.cell = 48;
    this.dpr = 1;
    this.time = 0;
    this.shake = 0;
    this.theme = THEMES.ink;
    this.dirty = true;
    this.reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  }

  setTheme(name) {
    this.theme = THEMES[name] || THEMES.ink;
    this.dirty = true;
  }

  resize(maxW, maxH) {
    this.cell = Math.max(24, Math.floor(Math.min(maxW / COLS, maxH / ROWS)));
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = this.cell * COLS;
    const h = this.cell * ROWS;
    this.canvas.style.width = `${w}px`;
    this.canvas.style.height = `${h}px`;
    this.canvas.width = Math.round(w * this.dpr);
    this.canvas.height = Math.round(h * this.dpr);
    this.dirty = true;
  }

  /** Match the on-screen tiles to the board. New tiles drop in from above. */
  sync(board, { instant = false } = {}) {
    const fresh = Array(COLS).fill(0);
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) if (board[r][c] && !this.views.has(board[r][c].id)) fresh[c]++;
    }
    const seen = new Set();
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const t = board[r][c];
        if (!t) continue;
        seen.add(t.id);
        let v = this.views.get(t.id);
        if (!v) {
          v = { id: t.id, x: c, y: instant ? r : r - fresh[c] - 0.4, vy: 0, flash: 0 };
          this.views.set(t.id, v);
        }
        if (v.letter !== undefined && v.letter !== t.letter) v.flash = 1;
        v.letter = t.letter;
        v.kind = t.kind;
        v.timer = t.timer;
        v.tx = c;
        v.ty = r;
        v.x = c;
        if (instant) { v.y = r; v.vy = 0; }
      }
    }
    for (const id of [...this.views.keys()]) if (!seen.has(id)) this.views.delete(id);
    this.dirty = true;
  }

  centre(r, c) {
    return [(c + 0.5) * this.cell, (r + 0.5) * this.cell];
  }

  /** Burst tiles apart (used when a word is played). */
  pop(ids, { delayStep = 0.035, big = false } = {}) {
    ids.forEach((id, i) => {
      const v = this.views.get(id);
      if (!v) return;
      this.views.delete(id);
      const [px, py] = this.centre(v.y, v.x);
      this.effects.push({ type: 'ghost', v: { ...v }, t: -i * delayStep, dur: 0.3 });
      const colours = KIND_COLOURS[v.kind] || KIND_COLOURS.normal;
      const n = this.reducedMotion ? 4 : big ? 16 : 10;
      for (let k = 0; k < n; k++) {
        const a = Math.random() * Math.PI * 2;
        const sp = (0.4 + Math.random()) * this.cell * (big ? 7 : 5);
        this.effects.push({
          type: 'particle', x: px, y: py, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - this.cell * 3,
          t: -i * delayStep, dur: 0.6 + Math.random() * 0.4, size: this.cell * (0.06 + Math.random() * 0.08),
          colour: colours[k % colours.length], rot: Math.random() * 6, vr: (Math.random() - 0.5) * 14,
        });
      }
    });
    this.dirty = true;
  }

  floatText(text, r, c, { colour = '#ffd166', size = 0.62 } = {}) {
    const [x, y] = this.centre(r, c);
    this.effects.push({ type: 'text', text, x, y, t: 0, dur: 1.1, colour, size: this.cell * size });
  }

  rowFlash(row) {
    this.effects.push({ type: 'row', row, t: 0, dur: 0.45 });
  }

  ring(r, c, colour) {
    const [x, y] = this.centre(r, c);
    this.effects.push({ type: 'ring', x, y, t: 0, dur: 0.5, colour });
  }

  shakeBoard(amount) {
    if (!this.reducedMotion) this.shake = Math.max(this.shake, amount);
  }

  setSelection(path, valid) {
    this.selection = path;
    this.selectionValid = valid;
    this.dirty = true;
  }

  showHint(path, seconds = 3.5) {
    this.hint = { path, until: this.time + seconds };
    this.dirty = true;
  }

  clearHint() {
    this.hint = null;
    this.dirty = true;
  }

  /** Which cell is under the finger. `inner` ignores the corners (for diagonal swipes). */
  cellAt(clientX, clientY, inner = false) {
    const rect = this.canvas.getBoundingClientRect();
    const x = (clientX - rect.left) / this.cell;
    const y = (clientY - rect.top) / this.cell;
    const c = Math.floor(x);
    const r = Math.floor(y);
    if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return null;
    if (inner) {
      const dx = x - (c + 0.5);
      const dy = y - (r + 0.5);
      if (dx * dx + dy * dy > 0.4 * 0.4) return null;
    }
    return [r, c];
  }

  isBusy() {
    if (this.effects.length) return true;
    for (const v of this.views.values()) if (v.y !== v.ty || v.vy !== 0 || v.flash > 0) return true;
    return false;
  }

  needsContinuousDraw() {
    if (this.hint || this.shake > 0) return true;
    for (const v of this.views.values()) if (v.kind !== 'normal') return true;
    return false;
  }

  update(dt) {
    this.time += dt;
    for (const v of this.views.values()) {
      if (v.flash > 0) v.flash = Math.max(0, v.flash - dt * 3);
      if (v.y < v.ty || v.vy !== 0) {
        v.vy += GRAVITY * dt;
        v.y += v.vy * dt;
        if (v.y >= v.ty) {
          v.y = v.ty;
          v.vy = v.vy > 4 && !this.reducedMotion ? -v.vy * 0.16 : 0;
          if (Math.abs(v.vy) < 0.6) v.vy = 0;
        }
      } else if (v.y > v.ty) {
        v.y = v.ty;
      }
    }
    for (const e of this.effects) {
      e.t += dt;
      if (e.type === 'particle' && e.t > 0) {
        e.vy += this.cell * 22 * dt;
        e.x += e.vx * dt;
        e.y += e.vy * dt;
        e.rot += e.vr * dt;
      }
    }
    this.effects = this.effects.filter((e) => e.t < e.dur);
    if (this.hint && this.time > this.hint.until) this.hint = null;
    if (this.shake > 0) this.shake = Math.max(0, this.shake - dt * 2.5);
  }

  draw() {
    const { ctx, cell, theme } = this;
    const W = cell * COLS;
    const H = cell * ROWS;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);

    ctx.save();
    if (this.shake > 0) {
      const m = this.shake * cell * 0.12;
      ctx.translate((Math.random() - 0.5) * m, (Math.random() - 0.5) * m);
    }

    // Board background and cell wells.
    ctx.fillStyle = theme.board;
    roundRect(ctx, 0, 0, W, H, cell * 0.3);
    ctx.fill();
    ctx.fillStyle = theme.cell;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        roundRect(ctx, c * cell + cell * 0.08, r * cell + cell * 0.1, cell * 0.84, cell * 0.84, cell * 0.16);
        ctx.fill();
      }
    }

    ctx.save();
    roundRect(ctx, 0, 0, W, H, cell * 0.3);
    ctx.clip();

    const selected = new Map(this.selection.map(([r, c], i) => [r * 100 + c, i]));
    const hinted = new Set((this.hint?.path || []).map(([r, c]) => r * 100 + c));

    for (const e of this.effects) if (e.type === 'row') this.drawRowFlash(e);

    const ordered = [...this.views.values()];
    for (const v of ordered) {
      const key = v.ty * 100 + v.tx;
      this.drawTile(v, selected.has(key) && v.y === v.ty, hinted.has(key));
    }
    if (this.selection.length > 1) this.drawPath();
    for (const v of ordered) {
      const key = v.ty * 100 + v.tx;
      this.drawLetter(v, selected.has(key) && v.y === v.ty);
    }
    ctx.restore();

    for (const e of this.effects) {
      if (e.t < 0) continue;
      if (e.type === 'ghost') this.drawGhost(e);
      else if (e.type === 'particle') this.drawParticle(e);
      else if (e.type === 'ring') this.drawRing(e);
    }
    for (const e of this.effects) if (e.type === 'text') this.drawFloatText(e);
    ctx.restore();
    this.dirty = false;
  }

  tileBox(v, scale = 1) {
    const { cell } = this;
    const s = cell * 0.88 * scale;
    const cx = (v.x + 0.5) * cell;
    const cy = (v.y + 0.5) * cell;
    return { x: cx - s / 2, y: cy - s / 2 - cell * 0.02, s, cx, cy };
  }

  drawTile(v, isSelected, isHinted) {
    const { ctx, cell, theme, time } = this;
    const scale = isSelected ? 1.07 : 1;
    const { x, y, s, cx, cy } = this.tileBox(v, scale);
    const r = cell * 0.17;
    const edge = cell * 0.07;
    let top;
    let face;
    let edgeColour;
    switch (v.kind) {
      case 'gold': top = '#fff1b8'; face = '#f4b52c'; edgeColour = '#a8740c'; break;
      case 'crystal': top = '#e6fbff'; face = '#8fb0ff'; edgeColour = '#4a62c9'; break;
      case 'bolt': top = '#3b4160'; face = '#23273b'; edgeColour = '#11131f'; break;
      case 'glitch': top = '#5a1a48'; face = '#2d0b26'; edgeColour = '#16040f'; break;
      case 'wild': top = '#ffffff'; face = '#ffffff'; edgeColour = '#8d6fd1'; break;
      default: top = theme.tileTop; face = theme.tile; edgeColour = theme.tileEdge;
    }
    if (isSelected && v.kind === 'normal') { top = theme.selectTop; face = theme.select; edgeColour = theme.selectEdge; }

    // Edge (gives a chunky 3D look).
    ctx.fillStyle = edgeColour;
    roundRect(ctx, x, y + edge, s, s, r);
    ctx.fill();

    // Face.
    let fill;
    if (v.kind === 'wild') {
      fill = ctx.createLinearGradient(x, y, x + s, y + s);
      const hue = (time * 60) % 360;
      for (let i = 0; i <= 4; i++) fill.addColorStop(i / 4, `hsl(${(hue + i * 72) % 360} 85% 62%)`);
    } else {
      fill = ctx.createLinearGradient(0, y, 0, y + s);
      fill.addColorStop(0, top);
      fill.addColorStop(1, face);
    }
    ctx.fillStyle = fill;
    roundRect(ctx, x, y, s, s, r);
    ctx.fill();

    if (v.kind === 'gold' || v.kind === 'crystal') {
      // Moving shine.
      ctx.save();
      roundRect(ctx, x, y, s, s, r);
      ctx.clip();
      const p = ((time * 0.6 + v.id * 0.37) % 2) - 0.5;
      const sx = x + p * s * 2;
      const g = ctx.createLinearGradient(sx - s * 0.3, y, sx + s * 0.3, y + s);
      g.addColorStop(0, 'rgba(255,255,255,0)');
      g.addColorStop(0.5, 'rgba(255,255,255,0.55)');
      g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = g;
      ctx.fillRect(x, y, s, s);
      ctx.restore();
    }

    if (v.kind === 'glitch') {
      ctx.save();
      roundRect(ctx, x, y, s, s, r);
      ctx.clip();
      ctx.fillStyle = 'rgba(255, 61, 110, 0.18)';
      for (let i = 0; i < 4; i++) ctx.fillRect(x, y + ((time * 40 + i * s / 4) % s), s, cell * 0.03);
      if (Math.random() < 0.18) {
        ctx.fillStyle = Math.random() < 0.5 ? 'rgba(0,229,255,0.45)' : 'rgba(255,61,110,0.5)';
        ctx.fillRect(x + (Math.random() - 0.5) * cell * 0.2, y + Math.random() * s, s, cell * (0.04 + Math.random() * 0.08));
      }
      ctx.restore();
      const urgent = v.timer <= 2;
      ctx.lineWidth = cell * 0.05;
      ctx.strokeStyle = urgent ? `rgba(255,61,110,${0.6 + 0.4 * Math.sin(time * 10)})` : '#ff3d6e';
      roundRect(ctx, x, y, s, s, r);
      ctx.stroke();
    }

    if (v.kind === 'bolt') {
      ctx.lineWidth = cell * 0.045;
      ctx.strokeStyle = '#ffd166';
      roundRect(ctx, x + cell * 0.03, y + cell * 0.03, s - cell * 0.06, s - cell * 0.06, r * 0.8);
      ctx.stroke();
    }

    if (isSelected && v.kind !== 'normal') {
      ctx.lineWidth = cell * 0.07;
      ctx.strokeStyle = theme.select;
      roundRect(ctx, x - cell * 0.02, y - cell * 0.02, s + cell * 0.04, s + cell * 0.04, r);
      ctx.stroke();
    }

    if (isHinted) {
      ctx.lineWidth = cell * 0.08;
      ctx.strokeStyle = `rgba(255, 255, 255, ${0.5 + 0.5 * Math.sin(time * 8)})`;
      roundRect(ctx, x - cell * 0.03, y - cell * 0.03, s + cell * 0.06, s + cell * 0.06, r * 1.1);
      ctx.stroke();
    }

    if (v.flash > 0) {
      ctx.fillStyle = `rgba(255,255,255,${v.flash * 0.8})`;
      roundRect(ctx, x, y, s, s, r);
      ctx.fill();
    }
    v._cx = cx;
    v._cy = cy;
  }

  drawLetter(v, isSelected) {
    const { ctx, cell, theme, time } = this;
    const { x, y, s, cx, cy } = this.tileBox(v, isSelected ? 1.07 : 1);
    const text = v.letter;
    const size = cell * (text === 'Qu' ? 0.42 : 0.52);
    ctx.font = `800 ${size}px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    let colour = theme.letter;
    if (v.kind === 'gold') colour = '#4a3000';
    else if (v.kind === 'crystal') colour = '#12235a';
    else if (v.kind === 'bolt' || v.kind === 'glitch' || v.kind === 'wild') colour = '#ffffff';
    else if (isSelected) colour = '#2a1d00';
    const ly = cy + cell * 0.02;

    if (v.kind === 'glitch') {
      const j = Math.random() < 0.2 ? cell * 0.05 : cell * 0.02;
      ctx.fillStyle = 'rgba(0,229,255,0.8)';
      ctx.fillText(text, cx - j, ly);
      ctx.fillStyle = 'rgba(255,61,110,0.85)';
      ctx.fillText(text, cx + j, ly);
    }
    if (v.kind === 'wild') {
      ctx.fillStyle = 'rgba(0,0,0,0.25)';
      ctx.fillText('?', cx, ly + cell * 0.03);
    }
    ctx.fillStyle = colour;
    ctx.fillText(text, cx, ly);

    // Small point value.
    if (v.kind !== 'wild') {
      ctx.font = `700 ${cell * 0.17}px ${FONT}`;
      ctx.textAlign = 'right';
      ctx.textBaseline = 'alphabetic';
      ctx.fillStyle = v.kind === 'normal' && !isSelected ? theme.value : 'rgba(255,255,255,0.75)';
      if (v.kind === 'gold' || v.kind === 'crystal' || (isSelected && v.kind === 'normal')) ctx.fillStyle = 'rgba(0,0,0,0.45)';
      ctx.fillText(String(letterValue(v.letter)), x + s - cell * 0.09, y + s - cell * 0.08);
    }

    // Badges.
    if (v.kind === 'glitch') {
      const br = cell * 0.15;
      const bx = x + br * 0.9;
      const by = y + br * 0.9;
      const urgent = v.timer <= 2;
      const pulse = urgent ? 1 + 0.15 * Math.sin(time * 12) : 1;
      ctx.fillStyle = urgent ? '#ff3d6e' : '#7c2cff';
      ctx.beginPath();
      ctx.arc(bx, by, br * pulse, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.font = `800 ${cell * 0.19}px ${FONT}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(v.timer), bx, by + cell * 0.01);
    } else if (v.kind === 'bolt') {
      this.drawBoltIcon(x + cell * 0.17, y + cell * 0.17, cell * 0.2);
    } else if (v.kind === 'gold' || v.kind === 'crystal') {
      ctx.font = `800 ${cell * 0.16}px ${FONT}`;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillText(v.kind === 'gold' ? '×2' : '×3', x + cell * 0.08, y + cell * 0.06);
    }
  }

  drawBoltIcon(cx, cy, size) {
    const { ctx } = this;
    ctx.fillStyle = '#ffd166';
    ctx.beginPath();
    ctx.moveTo(cx + size * 0.1, cy - size * 0.5);
    ctx.lineTo(cx - size * 0.35, cy + size * 0.08);
    ctx.lineTo(cx - size * 0.02, cy + size * 0.08);
    ctx.lineTo(cx - size * 0.12, cy + size * 0.5);
    ctx.lineTo(cx + size * 0.35, cy - size * 0.1);
    ctx.lineTo(cx + size * 0.02, cy - size * 0.1);
    ctx.closePath();
    ctx.fill();
  }

  drawPath() {
    const { ctx, cell, theme } = this;
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = this.selectionValid ? theme.pathValid : theme.path;
    ctx.lineWidth = cell * 0.16;
    ctx.beginPath();
    this.selection.forEach(([r, c], i) => {
      const [x, y] = this.centre(r, c);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
    ctx.restore();
  }

  drawGhost(e) {
    const { ctx, cell } = this;
    const p = Math.min(1, e.t / e.dur);
    ctx.save();
    ctx.globalAlpha = 1 - p;
    const v = { ...e.v };
    const scale = 1 + p * 0.45;
    const { x, y, s } = this.tileBox(v, scale);
    ctx.fillStyle = v.kind === 'gold' ? '#ffd166' : v.kind === 'crystal' ? '#9ff0ff' : v.kind === 'glitch' ? '#ff3d6e' : '#ffffff';
    roundRect(ctx, x, y, s, s, cell * 0.17 * scale);
    ctx.fill();
    ctx.restore();
  }

  drawParticle(e) {
    const { ctx } = this;
    const p = e.t / e.dur;
    ctx.save();
    ctx.globalAlpha = Math.max(0, 1 - p);
    ctx.translate(e.x, e.y);
    ctx.rotate(e.rot);
    ctx.fillStyle = e.colour;
    ctx.fillRect(-e.size / 2, -e.size / 2, e.size, e.size);
    ctx.restore();
  }

  drawRing(e) {
    const { ctx, cell } = this;
    const p = e.t / e.dur;
    ctx.save();
    ctx.globalAlpha = 1 - p;
    ctx.strokeStyle = e.colour;
    ctx.lineWidth = cell * 0.08 * (1 - p) + 1;
    ctx.beginPath();
    ctx.arc(e.x, e.y, cell * (0.4 + p * 1.6), 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  drawRowFlash(e) {
    const { ctx, cell } = this;
    const p = e.t / e.dur;
    ctx.save();
    ctx.globalAlpha = (1 - p) * 0.9;
    const g = ctx.createLinearGradient(0, 0, cell * COLS, 0);
    g.addColorStop(0, 'rgba(255,209,102,0)');
    g.addColorStop(0.5, 'rgba(255,240,180,1)');
    g.addColorStop(1, 'rgba(255,209,102,0)');
    ctx.fillStyle = g;
    const h = cell * (0.9 + p * 0.5);
    ctx.fillRect(0, (e.row + 0.5) * cell - h / 2, cell * COLS, h);
    ctx.restore();
  }

  drawFloatText(e) {
    const { ctx, cell } = this;
    const p = e.t / e.dur;
    const scale = p < 0.15 ? 0.6 + (p / 0.15) * 0.5 : 1.1 - Math.min(0.1, (p - 0.15));
    const W = cell * COLS;
    ctx.save();
    ctx.globalAlpha = p > 0.7 ? 1 - (p - 0.7) / 0.3 : 1;
    ctx.font = `900 ${e.size * scale}px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const width = ctx.measureText(e.text).width;
    const x = Math.min(Math.max(e.x, width / 2 + 6), W - width / 2 - 6);
    const y = e.y - p * cell * 1.2;
    ctx.lineWidth = e.size * 0.18;
    ctx.strokeStyle = 'rgba(0,0,0,0.55)';
    ctx.strokeText(e.text, x, y);
    ctx.fillStyle = e.colour;
    ctx.fillText(e.text, x, y);
    ctx.restore();
  }
}
