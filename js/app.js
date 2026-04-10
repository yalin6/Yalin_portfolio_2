(function () {
  'use strict';

  /* ── LOADER ── */
  const loader = document.createElement('div');
  loader.className = 'page-loader';
  loader.innerHTML = `
    <div class="page-loader__name">İrem <span>Yalın</span></div>
    <div class="page-loader__bar"><div class="page-loader__fill"></div></div>
    <div class="page-loader__sub">Materials Engineer · Istanbul</div>
  `;
  document.body.prepend(loader);

  window.addEventListener('load', () => {
    setTimeout(() => {
      loader.classList.add('hidden');
      setTimeout(() => loader.remove(), 800);
      initReveal();
    }, 2400);
  });

  /* ── CANVAS PARTICLE SYSTEM ── */
  const canvas = document.getElementById('bgCanvas');
  const ctx = canvas.getContext('2d');
  let W, H, particles;
  let mouse = { x: -999, y: -999 };
  const COUNT = window.innerWidth < 768 ? 60 : 110;
  const CONNECT = 150;
  const REPEL = 110;

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  class Particle {
    constructor() { this.init(true); }
    init(rand = false) {
      this.x = this.ox = Math.random() * W;
      this.y = this.oy = rand ? Math.random() * H : -10;
      this.vx = (Math.random() - .5) * .3;
      this.vy = (Math.random() - .5) * .3;
      this.r = .8 + Math.random() * 1.5;
      this.a = .2 + Math.random() * .5;
      const t = Math.random();
      if (t < .4) this.c = `rgba(80,100,255,${this.a})`;
      else if (t < .7) this.c = `rgba(64,208,255,${this.a})`;
      else if (t < .9) this.c = `rgba(200,160,80,${this.a})`;
      else this.c = `rgba(160,168,192,${this.a})`;
    }
    update() {
      const dx = this.x - mouse.x;
      const dy = this.y - mouse.y;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d < REPEL && d > 0) {
        const f = (REPEL - d) / REPEL;
        this.vx += (dx / d) * f * .1;
        this.vy += (dy / d) * f * .1;
      }
      this.vx += (this.ox - this.x) * .002;
      this.vy += (this.oy - this.y) * .002;
      this.vx *= .95; this.vy *= .95;
      this.x += this.vx; this.y += this.vy;
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = this.c;
      ctx.fill();
    }
  }

  function initParticles() {
    particles = Array.from({ length: COUNT }, () => new Particle());
  }

  function drawLines() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < CONNECT) {
          const a = (1 - d / CONNECT) * .15;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(80,100,255,${a})`;
          ctx.lineWidth = .5;
          ctx.stroke();
        }
      }
    }
  }

  function drawMouseGlow() {
    if (mouse.x < 0) return;
    const g = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 200);
    g.addColorStop(0, 'rgba(64,208,255,0.06)');
    g.addColorStop(.5, 'rgba(80,100,255,0.03)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(mouse.x, mouse.y, 200, 0, Math.PI * 2);
    ctx.fill();
  }

  /* ── GRID OVERLAY ON CANVAS ── */
  function drawGrid() {
    ctx.strokeStyle = 'rgba(80,100,255,0.025)';
    ctx.lineWidth = 1;
    const spacing = 80;
    for (let x = 0; x < W; x += spacing) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = 0; y < H; y += spacing) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }
  }

  function animate() {
    ctx.clearRect(0, 0, W, H);
    drawGrid();
    drawMouseGlow();
    drawLines();
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(animate);
  }

  resize();
  initParticles();
  animate();
  window.addEventListener('resize', () => { resize(); initParticles(); });

  /* ── CURSOR ── */
  const cursor = document.getElementById('cursor');
  const trail = document.getElementById('cursorTrail');
  let cx = 0, cy = 0, tx = 0, ty = 0;

  document.addEventListener('mousemove', e => {
    mouse.x = e.clientX; mouse.y = e.clientY;
    cx = e.clientX; cy = e.clientY;
    cursor.style.left = cx + 'px';
    cursor.style.top = cy + 'px';
  });

  (function lerpTrail() {
    tx += (cx - tx) * .1;
    ty += (cy - ty) * .1;
    trail.style.left = tx + 'px';
    trail.style.top = ty + 'px';
    requestAnimationFrame(lerpTrail);
  })();

  document.querySelectorAll('a,button,.tilt-card,.skill-tag,.contact__item').forEach(el => {
    el.addEventListener('mouseenter', () => { cursor.classList.add('cursor--hover'); trail.classList.add('cursor-trail--hover'); });
    el.addEventListener('mouseleave', () => { cursor.classList.remove('cursor--hover'); trail.classList.remove('cursor-trail--hover'); });
  });

  document.addEventListener('mouseleave', () => { mouse.x = -999; mouse.y = -999; });

  /* ── NAV ── */
  const nav = document.getElementById('nav');
  const menuBtn = document.getElementById('menuBtn');
  const mobileMenu = document.getElementById('mobileMenu');

  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 50);
    updateProgress();
    updateActiveLink();
  }, { passive: true });

  menuBtn.addEventListener('click', () => {
    menuBtn.classList.toggle('open');
    mobileMenu.classList.toggle('open');
    document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
  });
  document.querySelectorAll('.mobile-menu__link').forEach(l => {
    l.addEventListener('click', () => {
      menuBtn.classList.remove('open');
      mobileMenu.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  /* ── PROGRESS BAR ── */
  const progressBar = document.getElementById('progressBar');
  function updateProgress() {
    const p = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
    progressBar.style.width = (p * 100) + '%';
  }

  /* ── ACTIVE LINK ── */
  const sections = document.querySelectorAll('section[id]');
  function updateActiveLink() {
    const s = window.scrollY + 140;
    sections.forEach(sec => {
      const link = document.querySelector(`.nav__link[href="#${sec.id}"]`);
      if (!link) return;
      link.classList.toggle('active', sec.offsetTop <= s && sec.offsetTop + sec.offsetHeight > s);
    });
  }

  /* ── REVEAL ── */
  function initReveal() {
    const els = document.querySelectorAll(
      '.section__header,.timeline__card,.exp__card,.project-card,' +
      '.cert-card,.stat-card,.about__text,.about__visual,' +
      '.contact__item,.skill-tag,.lang-card,.hero__eyebrow,' +
      '.hero__name,.hero__tagline,.hero__cta'
    );
    els.forEach(el => {
      if (!el.classList.contains('reveal-text')) el.classList.add('reveal-up');
    });

    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('revealed');
          const fill = e.target.querySelector?.('.lang-card__fill');
          if (fill) setTimeout(() => fill.classList.add('animated'), 200);
          io.unobserve(e.target);
        }
      });
    }, { threshold: .1, rootMargin: '0px 0px -50px 0px' });

    els.forEach((el, i) => {
      el.style.transitionDelay = Math.min(i * .035, .4) + 's';
      io.observe(el);
    });

    /* Hero reveal */
    document.querySelectorAll('.hero .reveal-text, .hero .hero__eyebrow, .hero .hero__name, .hero .hero__tagline, .hero .hero__cta').forEach((el, i) => {
      el.classList.add('reveal-text');
      setTimeout(() => el.classList.add('revealed'), 2600 + i * 150);
    });
  }

  /* ── COUNTERS ── */
  const counterIO = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const target = +el.dataset.target;
      const start = performance.now();
      const dur = 1400;
      (function step(now) {
        const t = Math.min((now - start) / dur, 1);
        const ease = 1 - Math.pow(1 - t, 3);
        el.textContent = Math.round(ease * target);
        if (t < 1) requestAnimationFrame(step);
        else el.textContent = target + '+';
      })(start);
      counterIO.unobserve(el);
    });
  }, { threshold: .5 });
  document.querySelectorAll('.counter').forEach(el => counterIO.observe(el));

  /* ── 3D TILT ── */
  document.querySelectorAll('.tilt-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const rx = ((e.clientY - r.top) / r.height - .5) * 10;
      const ry = -((e.clientX - r.left) / r.width - .5) * 10;
      card.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(12px)`;
      card.style.boxShadow = `${-ry * 2}px ${rx * 2}px 40px rgba(80,100,255,0.15)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
      card.style.boxShadow = '';
    });
  });

  /* ── MAGNETIC BUTTONS ── */
  document.querySelectorAll('.magnetic').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const r = btn.getBoundingClientRect();
      const dx = (e.clientX - r.left - r.width / 2) * .35;
      const dy = (e.clientY - r.top - r.height / 2) * .35;
      btn.style.transform = `translate(${dx}px,${dy}px)`;
    });
    btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
  });

  /* ── SMOOTH SCROLL ── */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const t = document.querySelector(a.getAttribute('href'));
      if (t) { e.preventDefault(); t.scrollIntoView({ behavior: 'smooth' }); }
    });
  });

  /* ── HERO PARALLAX ── */
  const heroName = document.querySelector('.hero__name');
  if (heroName) {
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      heroName.style.transform = `translateY(${y * .15}px)`;
      heroName.style.opacity = Math.max(0, 1 - y / 600);
    }, { passive: true });
  }

  /* ── FLOAT PARALLAX ── */
  document.addEventListener('mousemove', e => {
    const mx = (e.clientX / W - .5) * 25;
    const my = (e.clientY / H - .5) * 25;
    document.querySelectorAll('.hero__float').forEach((el, i) => {
      const d = .3 + i * .2;
      el.style.transform = `translate(${mx * d}px,${my * d}px)`;
    });
  });

  /* ── TEXT SCRAMBLE on section titles ── */
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%';
  function scramble(el) {
    const original = el.textContent;
    let frame = 0;
    const total = 18;
    const interval = setInterval(() => {
      el.textContent = original.split('').map((c, i) => {
        if (c === ' ') return ' ';
        if (frame / total > i / original.length) return c;
        return chars[Math.floor(Math.random() * chars.length)];
      }).join('');
      frame++;
      if (frame > total) { el.textContent = original; clearInterval(interval); }
    }, 35);
  }

  document.querySelectorAll('.section__title').forEach(el => {
    const io2 = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { scramble(el); io2.unobserve(el); } });
    }, { threshold: .5 });
    io2.observe(el);
  });

})();
