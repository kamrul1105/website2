/**
 * ══════════════════════════════════════════════════════════
 *  ROMANTIC DATE WEBSITE — script.js
 *  No frameworks • Vanilla ES6+ • Mobile-first
 * ══════════════════════════════════════════════════════════
 *
 *  CUSTOMIZE HERE ↓ ↓ ↓
 */

/** Her name — shown nowhere by default but easy to add */
const HER_NAME = 'my love';

/** Funny messages shown when she taps NO */
const FUNNY_MESSAGES = [
  'Nice try 😜',
  'Nope 😂',
  'Are you sure? 🥺',
  'Think again ❤️',
  'You know you want to 😆',
  'I\'ll keep asking 😁',
  'That button is BROKEN 😇',
  'Hehe… come on 🥺',
  'Not an option! 💕',
  'Psst… the YES button is better 😍',
];

/** Places to pick from */
const PLACES = [
  { emoji: '☕', label: 'Coffee Date' },
  { emoji: '🍕', label: 'Pizza Night' },
  { emoji: '🍔', label: 'Burger Run' },
  { emoji: '🍜', label: 'Noodles' },
  { emoji: '🍣', label: 'Sushi' },
  { emoji: '🍿', label: 'Movie Night' },
  { emoji: '🌳', label: 'Park Walk' },
  { emoji: '🍨', label: 'Ice Cream' },
  { emoji: '🏖️', label: 'Anywhere You Want' },
  { emoji: '✨', label: 'Surprise Me!' },
];

/* ── END CUSTOMIZATION ───────────────────── */

/* ══════════════════════════════════════════
   STATE
══════════════════════════════════════════ */
let noClickCount   = 0;   // how many times NO was tapped
let yesScale       = 1;   // current scale multiplier for YES button
let heartRate      = 1;   // multiplier for background heart density
let selectedPlace  = null;
let musicPlaying   = false;
let isDark         = false;
let heartParticles = [];  // floating background hearts
let confettiPieces = [];  // confetti on YES

/* ══════════════════════════════════════════
   DOM REFERENCES
══════════════════════════════════════════ */
const loader        = document.getElementById('loader');
const heartsCanvas  = document.getElementById('heartsCanvas');
const hCtx          = heartsCanvas.getContext('2d');
const confettiCanvas= document.getElementById('confettiCanvas');
const cCtx          = confettiCanvas.getContext('2d');
const bgMusic       = document.getElementById('bgMusic');
const musicToggle   = document.getElementById('musicToggle');
const darkToggle    = document.getElementById('darkToggle');
const introTitle    = document.getElementById('introTitle');
const introSub      = document.getElementById('introSub');
const btnContinue   = document.getElementById('btnContinue');
const btnYes        = document.getElementById('btnYes');
const btnNo         = document.getElementById('btnNo');
const funnyMsg      = document.getElementById('funnyMessage');
const placesGrid    = document.getElementById('placesGrid');
const btnToFinal    = document.getElementById('btnToFinal');
const datePicker    = document.getElementById('datePicker');
const timePicker    = document.getElementById('timePicker');

/* ══════════════════════════════════════════
   SCREEN NAVIGATION
══════════════════════════════════════════ */

/** Switch to a new screen with a fade transition */
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const target = document.getElementById(id);
  if (target) {
    // slight delay so the fade-out registers first
    setTimeout(() => target.classList.add('active'), 30);
  }
}

/* ══════════════════════════════════════════
   TYPEWRITER EFFECT
══════════════════════════════════════════ */

/**
 * Types text into an element character by character.
 * Returns a Promise that resolves when done.
 */
function typewrite(el, text, speed = 55) {
  return new Promise(resolve => {
    el.textContent = '';
    el.classList.add('typing');
    let i = 0;
    const tick = () => {
      if (i < text.length) {
        el.textContent += text[i++];
        setTimeout(tick, speed);
      } else {
        el.classList.remove('typing');
        resolve();
      }
    };
    tick();
  });
}

/* ══════════════════════════════════════════
   LOADING SCREEN
══════════════════════════════════════════ */
window.addEventListener('load', () => {
  // Minimum display time so she sees the cute loader
  setTimeout(() => {
    loader.classList.add('hidden');
    document.body.classList.remove('loading');
    startIntro();
  }, 1600);
});

/* ══════════════════════════════════════════
   SCREEN 1 — INTRO + TYPEWRITER
══════════════════════════════════════════ */
async function startIntro() {
  await sleep(300);
  await typewrite(introTitle, 'Hey ❤️', 70);
  await sleep(400);
  await typewrite(introSub, 'I have something important to ask you…', 45);
  await sleep(200);
  // Reveal continue button
  btnContinue.style.transition = 'opacity 0.5s ease';
  btnContinue.style.opacity    = '1';
}

btnContinue.addEventListener('click', () => {
  playMusic(); // first interaction — start music
  showScreen('screen-question');
  positionNoButton(); // set initial NO position
});

/* ══════════════════════════════════════════
   SCREEN 2 — THE QUESTION & NO BUTTON LOGIC
══════════════════════════════════════════ */

/** Place NO button at a random on-screen position, away from YES */
function positionNoButton() {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const bw = btnNo.offsetWidth  || 120;
  const bh = btnNo.offsetHeight || 48;
  const margin = 20;

  // Get YES button bounds to avoid placing NO on top of it
  const yesRect = btnYes.getBoundingClientRect();

  let x, y, attempts = 0;
  do {
    x = margin + Math.random() * (vw - bw - margin * 2);
    y = margin + Math.random() * (vh - bh - margin * 2);
    attempts++;
  } while (
    attempts < 30 &&
    rectsOverlap(x, y, bw + 20, bh + 20,
                 yesRect.left, yesRect.top, yesRect.width + 20, yesRect.height + 20)
  );

  btnNo.style.left = x + 'px';
  btnNo.style.top  = y + 'px';
}

/** Returns true if two rectangles overlap */
function rectsOverlap(ax, ay, aw, ah, bx, by, bw, bh) {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

/** Called when NO is tapped */
function onNoClick() {
  noClickCount++;

  // Show a funny message
  const msg = FUNNY_MESSAGES[(noClickCount - 1) % FUNNY_MESSAGES.length];
  funnyMsg.textContent = msg;
  funnyMsg.style.animation = 'none';
  void funnyMsg.offsetWidth; // reflow to restart animation
  funnyMsg.style.animation = 'popIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)';

  // Special message after many tries
  if (noClickCount === 6) {
    funnyMsg.textContent = 'You really want to say no? 🥺';
  }

  // Grow the YES button (max 1.6×)
  yesScale = Math.min(1.6, 1 + noClickCount * 0.08);
  btnYes.style.transform = `scale(${yesScale})`;
  btnYes.style.fontSize  = (1.15 + noClickCount * 0.04) + 'rem';

  // More hearts!
  heartRate = Math.min(4, 1 + noClickCount * 0.25);

  // Animate NO to new position with smooth transition
  btnNo.classList.add('moving');
  positionNoButton();
  setTimeout(() => btnNo.classList.remove('moving'), 400);
}

// Touch + click for NO (mobile needs touchstart to be fast)
btnNo.addEventListener('touchstart', e => { e.preventDefault(); onNoClick(); }, { passive: false });
btnNo.addEventListener('click', onNoClick);

/* Also move NO if the pointer gets close (desktop hover evasion) */
btnNo.addEventListener('mousemove', onNoClick);

/* ── YES BUTTON ────────────────────────── */
btnYes.addEventListener('click', () => {
  showScreen('screen-yes');
  startConfetti();
  increaseHeartBurst();
});

/* ══════════════════════════════════════════
   SCREEN 3 — YES / CONFETTI
══════════════════════════════════════════ */
document.getElementById('btnPlanDate').addEventListener('click', () => {
  stopConfetti();
  // Set today as the default date min
  const today = new Date().toISOString().split('T')[0];
  datePicker.min   = today;
  datePicker.value = today;
  showScreen('screen-date');
});

/* ══════════════════════════════════════════
   SCREEN 4 — DATE PICKER
══════════════════════════════════════════ */
document.getElementById('btnToPlace').addEventListener('click', () => {
  if (!datePicker.value || !timePicker.value) {
    // Gentle pulse to draw attention to empty fields
    [datePicker, timePicker].forEach(el => {
      if (!el.value) {
        el.style.borderColor = 'var(--color-rose)';
        el.style.boxShadow   = '0 0 0 3px rgba(232,80,106,0.3)';
        setTimeout(() => {
          el.style.borderColor = '';
          el.style.boxShadow   = '';
        }, 1500);
      }
    });
    return;
  }
  showScreen('screen-place');
});

/* ══════════════════════════════════════════
   SCREEN 5 — PLACE PICKER
══════════════════════════════════════════ */

/** Render place cards from the PLACES array */
function renderPlaces() {
  placesGrid.innerHTML = '';
  PLACES.forEach((place, idx) => {
    const card = document.createElement('button');
    card.className   = 'place-card-item';
    card.setAttribute('aria-label', place.label);
    card.innerHTML   = `<span class="place-emoji">${place.emoji}</span>
                        <span class="place-label">${place.label}</span>`;
    card.style.animationDelay = (idx * 0.04) + 's';
    card.classList.add('fade-in-up');

    card.addEventListener('click', () => {
      // Deselect all, then select clicked
      document.querySelectorAll('.place-card-item').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      selectedPlace = place;
      btnToFinal.disabled = false;
    });

    placesGrid.appendChild(card);
  });
}

btnToFinal.addEventListener('click', () => {
  if (!selectedPlace) return;
  buildSummary();
  showScreen('screen-final');
});

/* ══════════════════════════════════════════
   SCREEN 6 — FINAL SUMMARY
══════════════════════════════════════════ */
function buildSummary() {
  // Format date nicely
  const raw = datePicker.value; // "YYYY-MM-DD"
  const [y, m, d] = raw.split('-').map(Number);
  const dateObj = new Date(y, m - 1, d);
  const dateStr = dateObj.toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  // Format time nicely
  const [hr, mn] = timePicker.value.split(':').map(Number);
  const ampm = hr >= 12 ? 'PM' : 'AM';
  const hr12 = ((hr % 12) || 12);
  const timeStr = `${hr12}:${String(mn).padStart(2, '0')} ${ampm}`;

  document.getElementById('summaryDate').textContent  = dateStr;
  document.getElementById('summaryTime').textContent  = timeStr;
  document.getElementById('summaryPlace').textContent = `${selectedPlace.emoji} ${selectedPlace.label}`;
}

/* ══════════════════════════════════════════
   FLOATING HEARTS CANVAS (background)
══════════════════════════════════════════ */

/** One floating heart particle */
class HeartParticle {
  constructor() { this.reset(); }

  reset() {
    this.x    = Math.random() * heartsCanvas.width;
    this.y    = heartsCanvas.height + 20;
    this.size = 8 + Math.random() * 16;
    this.speed= 0.4 + Math.random() * 0.8;
    this.drift= (Math.random() - 0.5) * 0.6;
    this.alpha= 0.15 + Math.random() * 0.45;
    this.rot  = (Math.random() - 0.5) * 0.4;
    this.rotSpeed = (Math.random() - 0.5) * 0.02;
    this.hue  = 340 + Math.random() * 30;   // pinks/reds
  }

  update() {
    this.y   -= this.speed;
    this.x   += this.drift;
    this.rot += this.rotSpeed;
    if (this.y < -this.size * 2) this.reset();
  }

  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rot);
    ctx.fillStyle = `hsl(${this.hue},80%,65%)`;
    drawHeart(ctx, 0, 0, this.size);
    ctx.fill();
    ctx.restore();
  }
}

/** Draw a heart shape centered at (cx, cy) with given size */
function drawHeart(ctx, cx, cy, size) {
  const s = size / 10;
  ctx.beginPath();
  ctx.moveTo(cx, cy + s * 2);
  ctx.bezierCurveTo(cx - s * 5, cy - s * 3, cx - s * 9, cy + s * 0.5, cx, cy + s * 4);
  ctx.bezierCurveTo(cx + s * 9, cy + s * 0.5, cx + s * 5, cy - s * 3, cx, cy + s * 2);
  ctx.closePath();
}

/** Resize canvas to fill viewport */
function resizeHeartsCanvas() {
  heartsCanvas.width  = window.innerWidth;
  heartsCanvas.height = window.innerHeight;
}

window.addEventListener('resize', () => {
  resizeHeartsCanvas();
  positionNoButton(); // keep NO button in bounds
});

resizeHeartsCanvas();

// Create initial particle pool
const BASE_HEARTS = 18;
for (let i = 0; i < BASE_HEARTS; i++) {
  const p = new HeartParticle();
  p.y = Math.random() * heartsCanvas.height; // spread initially
  heartParticles.push(p);
}

/** Add extra hearts (called when NO is tapped) */
function increaseHeartBurst() {
  const extra = 12;
  for (let i = 0; i < extra; i++) {
    const p = new HeartParticle();
    p.size  *= 1.4;
    p.alpha *= 1.3;
    heartParticles.push(p);
  }
}

/** Animate background hearts */
function animateHearts() {
  hCtx.clearRect(0, 0, heartsCanvas.width, heartsCanvas.height);

  // Maintain target particle count based on heartRate
  const target = Math.round(BASE_HEARTS * heartRate);
  while (heartParticles.length < target) {
    heartParticles.push(new HeartParticle());
  }

  heartParticles.forEach(p => {
    p.update();
    p.draw(hCtx);
  });

  requestAnimationFrame(animateHearts);
}

animateHearts();

/* ══════════════════════════════════════════
   CONFETTI (YES screen)
══════════════════════════════════════════ */

let confettiRunning = false;
let confettiRAF;

/** One confetti piece */
class ConfettiPiece {
  constructor() {
    this.x      = Math.random() * confettiCanvas.width;
    this.y      = -10;
    this.size   = 7 + Math.random() * 9;
    this.speed  = 2 + Math.random() * 3.5;
    this.drift  = (Math.random() - 0.5) * 2;
    this.rot    = Math.random() * Math.PI * 2;
    this.rotV   = (Math.random() - 0.5) * 0.15;
    this.color  = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
    this.shape  = Math.random() > 0.4 ? 'rect' : 'heart';
  }

  update() {
    this.y   += this.speed;
    this.x   += this.drift;
    this.rot += this.rotV;
  }

  draw(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rot);
    ctx.fillStyle = this.color;

    if (this.shape === 'heart') {
      ctx.globalAlpha = 0.9;
      drawHeart(ctx, 0, 0, this.size * 1.5);
      ctx.fill();
    } else {
      ctx.globalAlpha = 0.85;
      ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size * 0.55);
    }
    ctx.restore();
  }
}

const CONFETTI_COLORS = [
  '#E8506A','#FFB3C1','#FF7096','#FFCCD5','#FF4D6D',
  '#FFC8DD','#FF85A1','#FFAFCC','#BDE0FE','#A2D2FF',
];

function startConfetti() {
  confettiRunning = true;
  confettiCanvas.width  = window.innerWidth;
  confettiCanvas.height = window.innerHeight;
  confettiPieces = [];

  // Spawn pieces in bursts
  function spawn() {
    if (!confettiRunning) return;
    for (let i = 0; i < 5; i++) confettiPieces.push(new ConfettiPiece());
    setTimeout(spawn, 120);
  }
  spawn();
  animateConfetti();
}

function animateConfetti() {
  if (!confettiRunning && confettiPieces.length === 0) return;
  cCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
  confettiPieces = confettiPieces.filter(p => p.y < confettiCanvas.height + 20);
  confettiPieces.forEach(p => { p.update(); p.draw(cCtx); });
  confettiRAF = requestAnimationFrame(animateConfetti);
}

function stopConfetti() {
  confettiRunning = false;
  cancelAnimationFrame(confettiRAF);
  cCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
}

/* ══════════════════════════════════════════
   MUSIC
══════════════════════════════════════════ */

function playMusic() {
  if (musicPlaying) return;
  bgMusic.volume = 0.35;
  bgMusic.play().then(() => {
    musicPlaying  = true;
    musicToggle.textContent = '🔇';
  }).catch(() => {
    // Autoplay blocked — user will use the button
  });
}

musicToggle.addEventListener('click', () => {
  if (musicPlaying) {
    bgMusic.pause();
    musicPlaying = false;
    musicToggle.textContent = '🎵';
  } else {
    bgMusic.play();
    musicPlaying = true;
    musicToggle.textContent = '🔇';
  }
});

/* ══════════════════════════════════════════
   DARK MODE
══════════════════════════════════════════ */
darkToggle.addEventListener('click', () => {
  isDark = !isDark;
  document.body.classList.toggle('dark', isDark);
  darkToggle.textContent = isDark ? '☀️' : '🌙';
  // Persist preference
  try { localStorage.setItem('darkMode', isDark ? '1' : '0'); } catch (_) {}
});

// Restore preference
try {
  if (localStorage.getItem('darkMode') === '1') {
    isDark = true;
    document.body.classList.add('dark');
    darkToggle.textContent = '☀️';
  }
} catch (_) {}

/* ══════════════════════════════════════════
   INIT — RENDER PLACES
══════════════════════════════════════════ */
renderPlaces();

/* ══════════════════════════════════════════
   UTILITY
══════════════════════════════════════════ */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
