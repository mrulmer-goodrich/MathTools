// src/lib/confetti.js
// UG Math Tools — Confetti Service (no deps)
// Standard: ~3.2s duration, auto-stop, auto-cleanup, singleton canvas.

const STATE = {
  canvas: null,
  ctx: null,
  raf: null,
  t0: 0,
  running: false,
};

function createCanvas() {
  const id = "ug-confetti-canvas";
  let cv = document.getElementById(id);
  if (!cv) {
    cv = document.createElement("canvas");
    cv.id = id;
    cv.style.position = "fixed";
    cv.style.inset = "0";
    cv.style.width = "100%";
    cv.style.height = "100%";
    cv.style.pointerEvents = "none";
    cv.style.zIndex = "9999";
    document.body.appendChild(cv);
  }
  const ctx = cv.getContext("2d");
  const resize = () => {
    cv.width = window.innerWidth;
    cv.height = window.innerHeight;
  };
  resize();
  window.addEventListener("resize", resize);
  cv.__ugDetach = () => window.removeEventListener("resize", resize);
  return { cv, ctx };
}

function rand(min, max) { return Math.random() * (max - min) + min; }

function makeParticles(count, w, h) {
  const colors = ["#f44336","#ff9800","#ffeb3b","#4caf50","#2196f3","#9c27b0"];
  const parts = [];
  for (let i = 0; i < count; i++) {
    parts.push({
      x: rand(0, w),
      y: rand(-20, 0),
      vx: rand(-2, 2),
      vy: rand(2, 5),
      g: rand(0.03, 0.06),
      s: rand(3, 6),
      r: rand(0, Math.PI * 2),
      vr: rand(-0.2, 0.2),
      c: colors[(Math.random() * colors.length) | 0],
      life: rand(2.2, 3.2),
      t: 0
    });
  }
  return parts;
}

function animate(parts, dur) {
  if (!STATE.ctx || !STATE.canvas) return;
  const ctx = STATE.ctx;
  const cv = STATE.canvas;
  const now = performance.now();
  const elapsed = (now - STATE.t0) / 1000;
  ctx.clearRect(0, 0, cv.width, cv.height);

  for (const p of parts) {
    p.t += 1/60;
    p.vy += p.g;
    p.x += p.vx;
    p.y += p.vy;
    p.r += p.vr;

    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.r);
    ctx.fillStyle = p.c;
    ctx.fillRect(-p.s/2, -p.s/2, p.s, p.s);
    ctx.restore();
  }

  if (elapsed < dur) {
    STATE.raf = requestAnimationFrame(() => animate(parts, dur));
  } else {
    stop();
  }
}

function start(durationSec = 3.2, density = 220) {
  if (STATE.running) return; // cooldown guard
  const { cv, ctx } = createCanvas();
  STATE.canvas = cv;
  STATE.ctx = ctx;
  STATE.t0 = performance.now();
  STATE.running = true;

  const parts = makeParticles(density, cv.width, cv.height);
  animate(parts, durationSec);
}

function stop() {
  if (STATE.raf) cancelAnimationFrame(STATE.raf);
  const cv = STATE.canvas;
  if (cv && cv.__ugDetach) cv.__ugDetach();
  if (cv && cv.parentNode) cv.parentNode.removeChild(cv);
  STATE.canvas = null;
  STATE.ctx = null;
  STATE.raf = null;
  STATE.running = false;
}

const api = {
  burst() { start(3.2, 220); },
  start,
  stop
};

// Expose a stable singleton (ESM default export + global for ad-hoc calls)
if (typeof window !== "undefined") {
  if (!window.ugConfetti) window.ugConfetti = api;
}

export default api;
