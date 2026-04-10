/* ═══════════════════════════════════════════
   İrem Yalın Portfolio — app.js
   Liquid Metal Particle System + Interactions
   ═══════════════════════════════════════════ */

(function () {
  'use strict';

  /* ────────────────────────────────────────
     PAGE LOADER
  ──────────────────────────────────────── */
  const loaderEl = document.createElement('div');
  loaderEl.className = 'page-loader';
  loaderEl.innerHTML = `
    <div class="page-loader__name">İrem Yalın</div>
    <div class="page-loader__bar"><div class="page-loader__fill"></div></div>
  `;
  document.body.classList.add('loading');
  document.body.prepend(loaderEl);

  window.addEventListener('load', () => {
    setTimeout(() => {
      loaderEl.classList.add('hidden');
      document.body.classList.remove('loading');
      setTimeout(() => loaderEl.remove(), 700);
      // Start reveal animations after load
      initReveal();
    }, 2000);
  });

  /* ────────────────────────────────────────
     CANVAS — LIQUID METAL PARTICLE SYSTEM
  ──────────────────────────────────────── */
  const canvas = document.getElementById('bgCanvas');
  const ctx    = canvas.getContext('2d');

  let W, H, particles, mouse = { x: -999, y: -999 };
  const PARTICLE_COUNT = window.innerWidth < 768 ? 55 : 100;
  const CONNECTION_DIST = 160;
  const REPEL_DIST      = 120;
  const REPEL_FORCE     = 0.08;
  const MOUSE_GLOW_RADIUS = 220;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  class Particle {
    constructor() { this.reset(true); }
    reset(init = false) {
      this.x   = Math.random() * W;
      this.y   = init ? Math.random() * H : -10;
      this.ox  = this.x;
      this.oy  = this.y;
      this.vx  = (Math.random() - 0.5) * 0.35;
      this.vy  = (Math.random() - 0.5) * 0.35;
      this.r   = 1.2 + Math.random() * 1.8;
      this.alpha = 0.25 + Math.random() * 0.45;
      // Gold / silver / blue tint
      const t = Math.random();
      if (t < 0.55)      this.color = `rgba(192,160,96,${this.alpha})`;
      else if (t < 0.82) this.color = `rgba(200,200,212,${this.alpha})`;
      else               this.color = `rgba(112,144,200,${this.alpha})`;
    }
    update() {
      // Mouse repel
      const dx = this.x - mouse.x;
      const dy = this.y - mouse.y;
      const d  = Math.sqrt(dx * dx + dy * dy);
      if (d < REPEL_DIST && d > 0) {
        const force = (REPEL_DIST - d) / REPEL_DIST;
        this.vx += (dx / d) * force * REPEL_FORCE;
        this.vy += (dy / d) * force * REPEL_FORCE;
      }
      // Spring back
      this.vx += (this.ox - this.x) * 0.002;
      this.vy += (this.oy - this.y) * 0.002;
      // Friction
      this.vx *= 0.96;
      this.vy *= 0.96;
      this.x += this.vx;
      this.y += this.vy;
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.fill();
    }
  }

  function initParticles() {
    particles = Array.from({ length: PARTICLE_COUNT }, () => new Particle());
  }

  function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const d  = Math.sqrt(dx * dx + dy * dy);
        if (d < CONNECTION_DIST) {
          const alpha = (1 - d / CONNECTION_DIST) * 0.18;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(192,160,96,${alpha})`;
          ctx.lineWidth   = 0.6;
          ctx.stroke();
        }
      }
    }
  }

  function drawMouseGlow() {
    if (mouse.x < 0) return;
    const grad = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, MOUSE_GLOW_RADIUS);
    grad.addColorStop(0,   'rgba(192,160,96,0.08)');
    grad.addColorStop(0.5, 'rgba(112,144,200,0.04)');
    grad.addColorStop(1,   'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(mouse.x, mouse.y, MOUSE_GLOW_RADIUS, 0, Math.PI * 2);
    ctx.fill();
  }

  let animRAF;
  function animate() {
    ctx.clearRect(0, 0, W, H);
    drawMouseGlow();
    drawConnections();
    particles.forEach(p => { p.update(); p.draw(); });
    animRAF = requestAnimationFrame(animate);
  }

  resize();
  initParticles();
  animate();
  window.addEventListener('resize', () => { resize(); initParticles(); });

  /* ────────────────────────────────────────
     CUSTOM CURSOR
  ──────────────────────────────────────── */
  const cursor      = document.getElementById('cursor');
  const cursorTrail = document.getElementById('cursorTrail');
  let cursorX = 0, cursorY = 0;
  let trailX  = 0, trailY  = 0;

  document.addEventListener('mousemove', e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    cursorX = e.clientX;
    cursorY = e.clientY;
    cursor.style.left = cursorX + 'px';
    cursor.style.top  = cursorY + 'px';
  });

  // Lerp trail
  function updateTrail() {
    trailX += (cursorX - trailX) * 0.12;
    trailY += (cursorY - trailY) * 0.12;
    cursorTrail.style.left = trailX + 'px';
    cursorTrail.style.top  = trailY + 'px';
    requestAnimationFrame(updateTrail);
  }
  updateTrail();

  // Hover states
  document.querySelectorAll('a, button, .tilt-card, .skill-tag, .contact__item').forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursor.classList.add('cursor--hover');
      cursorTrail.classList.add('cursor-trail--hover');
    });
    el.addEventListener('mouseleave', () => {
      cursor.classList.remove('cursor--hover');
      cursorTrail.classList.remove('cursor-trail--hover');
    });
  });

  document.addEventListener('mousedown', () => cursor.classList.add('cursor--click'));
  document.addEventListener('mouseup',   () => cursor.classList.remove('cursor--click'));

  // Hide cursor when leaving viewport
  document.addEventListener('mouseleave', () => {
    cursor.style.opacity      = '0';
    cursorTrail.style.opacity = '0';
    mouse.x = -999; mouse.y = -999;
  });
  document.addEventListener('mouseenter', () => {
    cursor.style.opacity      = '';
    cursorTrail.style.opacity = '';
  });

  /* ────────────────────────────────────────
     NAVIGATION
  ──────────────────────────────────────── */
  const nav       = document.getElementById('nav');
  const menuBtn   = document.getElementById('menuBtn');
  const mobileMenu = document.getElementById('mobileMenu');

  // Scroll-based nav style
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
    updateProgress();
    updateActiveLink();
  }, { passive: true });

  // Mobile menu toggle
  menuBtn.addEventListener('click', () => {
    menuBtn.classList.toggle('open');
    mobileMenu.classList.toggle('open');
    document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
  });

  document.querySelectorAll('.mobile-menu__link').forEach(link => {
    link.addEventListener('click', () => {
      menuBtn.classList.remove('open');
      mobileMenu.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  /* ────────────────────────────────────────
     PROGRESS BAR
  ──────────────────────────────────────── */
  const progressBar = document.getElementById('progressBar');
  function updateProgress() {
    const scrollTop = window.scrollY;
    const docH      = document.documentElement.scrollHeight - window.innerHeight;
    progressBar.style.width = (scrollTop / docH * 100) + '%';
  }

  /* ────────────────────────────────────────
     ACTIVE NAV LINK
  ──────────────────────────────────────── */
  const sections = document.querySelectorAll('section[id]');
  function updateActiveLink() {
    const scroll = window.scrollY + 120;
    sections.forEach(s => {
      const link = document.querySelector(`.nav__link[href="#${s.id}"]`);
      if (!link) return;
      if (s.offsetTop <= scroll && s.offsetTop + s.offsetHeight > scroll) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  /* ────────────────────────────────────────
     INTERSECTION OBSERVER — REVEAL
  ──────────────────────────────────────── */
  function initReveal() {
    const revealEls = document.querySelectorAll(
      '.reveal-text, .reveal-up, .section__header, .timeline__card, ' +
      '.exp__card, .project-card, .cert-card, .stat-card, ' +
      '.about__text, .about__visual, .contact__item, .skill-tag, .lang-card'
    );

    // Add reveal-up to anything not already marked
    revealEls.forEach(el => {
      if (!el.classList.contains('reveal-text')) {
        el.classList.add('reveal-up');
      }
    });

    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          // Animate language bars
          const fill = entry.target.querySelector?.('.lang-card__fill');
          if (fill) fill.classList.add('animated');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

    revealEls.forEach((el, i) => {
      el.style.transitionDelay = (i * 0.04) + 's';
      io.observe(el);
    });

    // Hero triggers immediately
    document.querySelectorAll('.hero .reveal-text').forEach((el, i) => {
      setTimeout(() => el.classList.add('revealed'), 2200 + i * 180);
    });
  }

  /* ────────────────────────────────────────
     COUNTER ANIMATION
  ──────────────────────────────────────── */
  function animateCounter(el) {
    const target = parseInt(el.dataset.target);
    const dur    = 1200;
    const start  = performance.now();
    function step(now) {
      const t = Math.min((now - start) / dur, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      el.textContent = Math.round(ease * target);
      if (t < 1) requestAnimationFrame(step);
      else el.textContent = target + '+';
    }
    requestAnimationFrame(step);
  }

  const counterIO = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        animateCounter(e.target);
        counterIO.unobserve(e.target);
      }
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('.counter').forEach(el => counterIO.observe(el));

  /* ────────────────────────────────────────
     TILT EFFECT
  ──────────────────────────────────────── */
  document.querySelectorAll('.tilt-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const cx   = rect.left + rect.width  / 2;
      const cy   = rect.top  + rect.height / 2;
      const rx   = (e.clientY - cy) / (rect.height / 2);
      const ry   = -(e.clientX - cx) / (rect.width  / 2);
      card.style.transform = `perspective(1000px) rotateX(${rx * 4}deg) rotateY(${ry * 4}deg) translateZ(8px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
    });
  });

  /* ────────────────────────────────────────
     MAGNETIC BUTTONS
  ──────────────────────────────────────── */
  document.querySelectorAll('.magnetic').forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const rect = btn.getBoundingClientRect();
      const cx   = rect.left + rect.width  / 2;
      const cy   = rect.top  + rect.height / 2;
      const dx   = (e.clientX - cx) * 0.3;
      const dy   = (e.clientY - cy) * 0.3;
      btn.style.transform = `translate(${dx}px, ${dy}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
    });
  });

  /* ────────────────────────────────────────
     SMOOTH SCROLL
  ──────────────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  /* ────────────────────────────────────────
     SCROLL-TRIGGERED SECTION FADE
     (adds slight parallax to section titles)
  ──────────────────────────────────────── */
  function onScroll() {
    const scroll = window.scrollY;
    document.querySelectorAll('.section__title').forEach(el => {
      const rect    = el.getBoundingClientRect();
      const centerY = rect.top + rect.height / 2;
      const relY    = (window.innerHeight / 2 - centerY) * 0.04;
      el.style.transform = `translateY(${relY}px)`;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ────────────────────────────────────────
     HERO PARALLAX
  ──────────────────────────────────────── */
  const heroName = document.querySelector('.hero__name');
  if (heroName) {
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      heroName.style.transform = `translateY(${y * 0.2}px)`;
      heroName.style.opacity   = Math.max(0, 1 - y / 500);
    }, { passive: true });
  }

  /* ────────────────────────────────────────
     FLOATING ELEMENT MOUSE PARALLAX
  ──────────────────────────────────────── */
  document.addEventListener('mousemove', e => {
    const mx = (e.clientX / window.innerWidth  - 0.5) * 20;
    const my = (e.clientY / window.innerHeight - 0.5) * 20;
    document.querySelectorAll('.hero__float').forEach((el, i) => {
      const depth = 0.4 + i * 0.15;
      el.style.transform = `translate(${mx * depth}px, ${my * depth}px)`;
    });
  });

})();
