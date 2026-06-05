// ===== Smooth Cursor via requestAnimationFrame =====
const cursorRing = document.getElementById('cursor');
const cursorDot  = document.getElementById('cursor-dot');

let mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
let ring  = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

document.addEventListener('mousemove', e => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
  cursorDot.style.transform = `translate(${e.clientX - 2.5}px, ${e.clientY - 2.5}px) translate(-50%,-50%)`;
});

(function animateCursor() {
  ring.x += (mouse.x - ring.x) * 0.12;
  ring.y += (mouse.y - ring.y) * 0.12;
  cursorRing.style.transform = `translate(${ring.x}px, ${ring.y}px) translate(-50%,-50%)`;
  requestAnimationFrame(animateCursor);
})();

// Cursor states
const hoverTargets = document.querySelectorAll('a, button, .tilt-card, .tags span, input, textarea');
hoverTargets.forEach(el => {
  el.addEventListener('mouseenter', () => cursorRing.classList.add('hovering'));
  el.addEventListener('mouseleave', () => cursorRing.classList.remove('hovering'));
});
document.addEventListener('mousedown', () => cursorRing.classList.add('clicking'));
document.addEventListener('mouseup',   () => cursorRing.classList.remove('clicking'));

// ===== Scroll Progress =====
window.addEventListener('scroll', () => {
  const pct = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
  document.getElementById('scroll-progress').style.width = pct + '%';
}, { passive: true });

// ===== Navbar =====
const navbar    = document.getElementById('navbar');
const sections  = document.querySelectorAll('section[id]');
const navAnchors = document.querySelectorAll('.nav-links a');

window.addEventListener('scroll', () => {
  navbar.style.padding = window.scrollY > 60 ? '0.55rem 2.5rem' : '1.1rem 2.5rem';
  document.getElementById('back-to-top').classList.toggle('show', window.scrollY > 500);

  let current = '';
  sections.forEach(s => { if (window.scrollY >= s.offsetTop - 130) current = s.id; });
  navAnchors.forEach(a => a.classList.toggle('active', a.getAttribute('href') === `#${current}`));
}, { passive: true });

// ===== Hamburger =====
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('navLinks');
hamburger.addEventListener('click', () => {
  navLinks.classList.toggle('open');
  hamburger.classList.toggle('open');
});
navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  navLinks.classList.remove('open');
  hamburger.classList.remove('open');
}));

// ===== Back to Top =====
document.getElementById('back-to-top').addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

// ===== Particle Canvas =====
const canvas = document.getElementById('particles');
const ctx    = canvas.getContext('2d');
let W, H;

function resizeCanvas() {
  W = canvas.width  = window.innerWidth;
  H = canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Mouse repulsion
let mx = -1000, my = -1000;
document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

const COLORS = ['rgba(110,231,247,', 'rgba(167,139,250,', 'rgba(244,114,182,'];
class Dot {
  constructor() { this.init(); }
  init() {
    this.x  = Math.random() * W;
    this.y  = Math.random() * H;
    this.vx = (Math.random() - 0.5) * 0.3;
    this.vy = (Math.random() - 0.5) * 0.3;
    this.r  = Math.random() * 1.2 + 0.4;
    this.a  = Math.random() * 0.5 + 0.15;
    this.c  = COLORS[Math.floor(Math.random() * COLORS.length)];
  }
  update() {
    // Repel from mouse
    const dx = this.x - mx, dy = this.y - my;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 90) {
      this.vx += (dx / dist) * 0.4;
      this.vy += (dy / dist) * 0.4;
    }
    // Dampen
    this.vx *= 0.98; this.vy *= 0.98;
    this.x += this.vx; this.y += this.vy;
    if (this.x < 0) this.x = W;
    if (this.x > W) this.x = 0;
    if (this.y < 0) this.y = H;
    if (this.y > H) this.y = 0;
  }
  draw() {
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fillStyle = this.c + this.a + ')';
    ctx.fill();
  }
}

const dots = Array.from({ length: 100 }, () => new Dot());

function renderParticles() {
  ctx.clearRect(0, 0, W, H);
  dots.forEach(d => { d.update(); d.draw(); });
  // Lines
  for (let i = 0; i < dots.length; i++) {
    for (let j = i + 1; j < dots.length; j++) {
      const dx = dots[i].x - dots[j].x;
      const dy = dots[i].y - dots[j].y;
      const d  = Math.sqrt(dx * dx + dy * dy);
      if (d < 110) {
        ctx.beginPath();
        ctx.moveTo(dots[i].x, dots[i].y);
        ctx.lineTo(dots[j].x, dots[j].y);
        ctx.strokeStyle = `rgba(110,231,247,${0.1 * (1 - d / 110)})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    }
  }
  requestAnimationFrame(renderParticles);
}
renderParticles();

// ===== Mouse Parallax on Hero =====
const homeContent = document.querySelector('.home-content');
document.getElementById('home').addEventListener('mousemove', e => {
  const cx = window.innerWidth / 2, cy = window.innerHeight / 2;
  const dx = (e.clientX - cx) / cx;
  const dy = (e.clientY - cy) / cy;
  homeContent.style.transform = `translate(${dx * 12}px, ${dy * 8}px)`;
});
document.getElementById('home').addEventListener('mouseleave', () => {
  homeContent.style.transform = '';
});

// ===== Typewriter =====
const typedEl = document.getElementById('typed');
const phrases = ['AI & DS Student', 'MERN Stack Developer', 'Competitive Programmer', 'AI / ML Enthusiast', 'Full-Stack Developer'];
let pIdx = 0, cIdx = 0, deleting = false;

function typeWriter() {
  const cur = phrases[pIdx];
  typedEl.textContent = deleting ? cur.slice(0, cIdx--) : cur.slice(0, cIdx++);
  if (!deleting && cIdx > cur.length) { deleting = true; setTimeout(typeWriter, 1800); return; }
  if (deleting && cIdx < 0)          { deleting = false; cIdx = 0; pIdx = (pIdx + 1) % phrases.length; }
  setTimeout(typeWriter, deleting ? 45 : 90);
}
typeWriter();

// Glitch data-text
const nameEl = document.getElementById('name-glitch');
if (nameEl) nameEl.setAttribute('data-text', nameEl.textContent);

// ===== Section Title Letter Reveal =====
document.querySelectorAll('.section-title').forEach(title => {
  const text = title.textContent;
  title.innerHTML = text.split('').map(ch =>
    `<span class="char">${ch === ' ' ? '&nbsp;' : ch}</span>`
  ).join('') + '<span style="display:block"></span>'; // preserve ::after
});

// ===== Intersection Observer =====
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    el.classList.add('visible');

    // Skill bars
    el.querySelectorAll('.bar-fill').forEach(b => { b.style.width = b.dataset.width + '%'; });

    // Letter reveal on section titles inside viewport
    el.querySelectorAll('.char').forEach((ch, i) => {
      setTimeout(() => ch.classList.add('revealed'), i * 35);
    });

    observer.unobserve(el);
  });
}, { threshold: 0.12 });

document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

// Observe section titles separately
const titleObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.querySelectorAll('.char').forEach((ch, i) => {
      setTimeout(() => ch.classList.add('revealed'), i * 40);
    });
    titleObserver.unobserve(entry.target);
  });
}, { threshold: 0.5 });
document.querySelectorAll('.section-title').forEach(t => titleObserver.observe(t));

// ===== Stats Counter =====
const statsObs = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.querySelectorAll('.stat-num').forEach(el => {
      const target = +el.dataset.target;
      const dur = 1600;
      const step = 16;
      const inc = target / (dur / step);
      let cur = 0;
      const iv = setInterval(() => {
        cur = Math.min(cur + inc, target);
        el.textContent = Math.floor(cur) + (target >= 1000 ? '+' : '+');
        if (cur >= target) { el.textContent = target + '+'; clearInterval(iv); }
      }, step);
    });
    statsObs.unobserve(entry.target);
  });
}, { threshold: 0.4 });
const strip = document.getElementById('stats-strip');
if (strip) statsObs.observe(strip);

// ===== 3D Tilt =====
document.querySelectorAll('.tilt-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    const x = ((e.clientX - r.left) / r.width  - 0.5) * 16;
    const y = ((e.clientY - r.top)  / r.height - 0.5) * -16;
    card.style.transform    = `perspective(700px) rotateX(${y}deg) rotateY(${x}deg) translateY(-6px)`;
    card.style.boxShadow    = `${-x}px ${y}px 30px rgba(110,231,247,0.1)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
    card.style.boxShadow = '';
  });
});

// ===== Magnetic Buttons =====
document.querySelectorAll('.btn').forEach(btn => {
  btn.addEventListener('mousemove', e => {
    const r    = btn.getBoundingClientRect();
    const dx   = (e.clientX - (r.left + r.width  / 2)) * 0.35;
    const dy   = (e.clientY - (r.top  + r.height / 2)) * 0.35;
    btn.style.transform = `translate(${dx}px, ${dy}px)`;
  });
  btn.addEventListener('mouseleave', () => {
    btn.style.transform = '';
  });
});

// ===== Ripple =====
document.querySelectorAll('.ripple-btn').forEach(btn => {
  btn.addEventListener('click', e => {
    const c = document.createElement('span');
    c.classList.add('ripple');
    const r = btn.getBoundingClientRect();
    const s = Math.max(r.width, r.height);
    c.style.cssText = `width:${s}px;height:${s}px;left:${e.clientX - r.left - s/2}px;top:${e.clientY - r.top - s/2}px;`;
    btn.appendChild(c);
    setTimeout(() => c.remove(), 600);
  });
});

// ===== Contact Form =====
document.getElementById('contactForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const msg = document.getElementById('formMsg');
  
  // Get form data
  const formData = new FormData(this);
  const name = formData.get('name');
  const email = formData.get('email');
  const message = formData.get('message');
  
  // Send email using mailto link
  const subject = encodeURIComponent(`Portfolio Contact from ${name}`);
  const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`);
  window.location.href = `mailto:aadhithyabalu.s2024aids@sece.ac.in?subject=${subject}&body=${body}`;
  
  msg.textContent = '✅ Message sent! I\'ll get back to you soon.';
  this.reset();
  setTimeout(() => { msg.textContent = ''; }, 5000);
});
