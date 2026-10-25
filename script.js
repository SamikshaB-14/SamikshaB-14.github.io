const hamburger = document.getElementById('hamburger');
const navLinks = document.querySelector('.nav-links');
hamburger.addEventListener('click', () => navLinks.classList.toggle('open'));
navLinks.querySelectorAll('a').forEach(l => l.addEventListener('click', () => navLinks.classList.remove('open')));

// Reveal sections on scroll
const observer = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0, rootMargin: '0px 0px -50px 0px' });
const sections = document.querySelectorAll('section');
sections.forEach(s => {
  observer.observe(s);
  if (s.getBoundingClientRect().top < window.innerHeight) s.classList.add('visible');
});

// Active nav link
const navItems = document.querySelectorAll('.nav-links a');
window.addEventListener('scroll', () => {
  let current = '';
  sections.forEach(s => { if (window.scrollY >= s.offsetTop - 120) current = s.id; });
  navItems.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + current));
});

// Custom cursor
const cursor = document.getElementById('cursor');
document.addEventListener('mousemove', e => {
  cursor.style.left = e.clientX + 'px';
  cursor.style.top = e.clientY + 'px';
});
document.querySelectorAll('.card, .skill-category, .exp-card, .proj-card, .contact-card, .eng, a, button').forEach(el => {
  el.addEventListener('mouseenter', () => cursor.classList.add('hovering'));
  el.addEventListener('mouseleave', () => cursor.classList.remove('hovering'));
});

// ---- Monte Carlo RTP demo (original toy game, not a client engine) ----
// [symbol, weight per reel, payout multiplier for 3 of a kind]
const SYM = [['7', 2, 200], ['BAR', 5, 50], ['BELL', 10, 20], ['CHERRY', 20, 12], ['LEMON', 30, 6]];
const TOTAL_W = SYM.reduce((a, s) => a + s[1], 0);
const TARGET = SYM.reduce((a, s) => a + Math.pow(s[1] / TOTAL_W, 3) * s[2], 0); // exact RTP
const pick = () => {
  let r = Math.random() * TOTAL_W;
  for (const s of SYM) { if ((r -= s[1]) < 0) return s; }
  return SYM[SYM.length - 1];
};

const canvas = document.getElementById('chart');
const ctx = canvas.getContext('2d');
const $ = id => document.getElementById(id);
$('o-target').textContent = (TARGET * 100).toFixed(2) + '%';

function draw(points) {
  const W = canvas.width, H = canvas.height, top = TARGET * 2;
  const y = v => H - 10 - (Math.min(v, top) / top) * (H - 20);
  ctx.clearRect(0, 0, W, H);
  ctx.setLineDash([6, 5]);
  ctx.strokeStyle = '#5fd39a';
  ctx.beginPath(); ctx.moveTo(0, y(TARGET)); ctx.lineTo(W, y(TARGET)); ctx.stroke();
  ctx.setLineDash([]);
  ctx.strokeStyle = '#7f77dd';
  ctx.lineWidth = 2;
  ctx.beginPath();
  points.forEach((v, i) => {
    const x = (i / Math.max(points.length - 1, 1)) * (W - 4) + 2;
    i ? ctx.lineTo(x, y(v)) : ctx.moveTo(x, y(v));
  });
  ctx.stroke();
}

let busy = false;
function simulate(total) {
  if (busy) return;
  busy = true;
  let spins = 0, won = 0, hits = 0;
  const points = [], chunk = Math.ceil(total / 150);
  (function step() {
    for (let i = 0; i < chunk && spins < total; i++, spins++) {
      const a = pick(), b = pick(), c = pick();
      if (a === b && b === c) { won += a[2]; hits++; }
    }
    points.push(won / spins);
    draw(points);
    $('o-spins').textContent = spins.toLocaleString();
    $('o-rtp').textContent = (won / spins * 100).toFixed(2) + '%';
    $('o-hit').textContent = (hits / spins * 100).toFixed(2) + '%';
    if (spins < total) setTimeout(step, 0); else busy = false;
  })();
}
document.querySelectorAll('.sim-btns button').forEach(b =>
  b.addEventListener('click', () => simulate(+b.dataset.n)));
draw([]);