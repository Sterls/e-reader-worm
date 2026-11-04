// Full-screen confetti for celebrations.
const COLOURS = ['#ffd166', '#3ddc97', '#4dabf7', '#ff6b6b', '#b197fc', '#ffffff'];

export class Confetti {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.pieces = [];
    this.running = false;
  }

  burst(count = 120) {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) count = Math.min(count, 30);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.canvas.width = w * dpr;
    this.canvas.height = h * dpr;
    this.dpr = dpr;
    for (let i = 0; i < count; i++) {
      const fromLeft = i % 2 === 0;
      this.pieces.push({
        x: fromLeft ? -10 : w + 10, y: h * (0.55 + Math.random() * 0.2),
        vx: (fromLeft ? 1 : -1) * (250 + Math.random() * 450), vy: -(500 + Math.random() * 650),
        size: 6 + Math.random() * 7, rot: Math.random() * 6, vr: (Math.random() - 0.5) * 16,
        colour: COLOURS[i % COLOURS.length], life: 0, max: 2.2 + Math.random() * 1.2,
      });
    }
    if (!this.running) {
      this.running = true;
      this.last = performance.now();
      requestAnimationFrame((t) => this.frame(t));
    }
  }

  frame(now) {
    const dt = Math.min(0.05, (now - this.last) / 1000);
    this.last = now;
    const { ctx } = this;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    for (const p of this.pieces) {
      p.life += dt;
      p.vy += 900 * dt;
      p.vx *= 1 - 1.2 * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.rot += p.vr * dt;
      ctx.save();
      ctx.globalAlpha = Math.max(0, 1 - p.life / p.max);
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.colour;
      ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      ctx.restore();
    }
    this.pieces = this.pieces.filter((p) => p.life < p.max && p.y < window.innerHeight + 40);
    if (this.pieces.length) requestAnimationFrame((t) => this.frame(t));
    else {
      this.running = false;
      ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }
}
