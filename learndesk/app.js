/* LearnDesk Frontend Interactions */

const $ = (sel, parent = document) => parent.querySelector(sel);
const $$ = (sel, parent = document) => Array.from(parent.querySelectorAll(sel));

/* Mobile nav (optional expansion if needed later) */
(() => {
  const toggle = $('.nav-toggle');
  const nav = $('.main-nav');
  if (!toggle || !nav) return;
  toggle.addEventListener('click', () => {
    nav.classList.toggle('open');
  });
})();

/* Scroll reveal */
(() => {
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      }
    },
    { threshold: 0.12 }
  );
  $$('.reveal').forEach((el) => observer.observe(el));
})();

/* Tilt interaction for cards */
(() => {
  const clamp = (n, min, max) => Math.min(Math.max(n, min), max);
  $$("[data-tilt]").forEach((card) => {
    const bounds = () => card.getBoundingClientRect();
    const onMove = (e) => {
      const b = bounds();
      const px = (e.clientX - b.left) / b.width; // 0..1
      const py = (e.clientY - b.top) / b.height; // 0..1
      const rx = (py - 0.5) * -14; // rotateX
      const ry = (px - 0.5) * 16; // rotateY
      card.style.transform = `perspective(900px) rotateX(${clamp(rx,-16,16)}deg) rotateY(${clamp(ry,-18,18)}deg) translateZ(0)`;
    };
    const reset = () => (card.style.transform = 'perspective(900px) rotateX(0) rotateY(0)');
    card.addEventListener('mousemove', onMove);
    card.addEventListener('mouseleave', reset);
  });
})();

/* Background Canvas Particles reacting to pointer and motion */
(() => {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let dpr = Math.max(1, window.devicePixelRatio || 1);
  let width = 0, height = 0;
  let pointer = { x: 0, y: 0 };
  let tilt = { x: 0, y: 0 };

  const particles = [];
  const PARTICLE_COUNT = 120;

  function resize() {
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  window.addEventListener('resize', resize);
  resize();

  function rand(min, max) { return Math.random() * (max - min) + min; }
  function create() {
    particles.length = 0;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: rand(0, width),
        y: rand(0, height),
        vx: rand(-0.3, 0.3),
        vy: rand(-0.3, 0.3),
        r: rand(0.6, 2.2),
        a: rand(0.3, 0.9)
      });
    }
  }
  create();

  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    pointer.x = e.clientX - rect.left;
    pointer.y = e.clientY - rect.top;
  });

  function step() {
    ctx.clearRect(0, 0, width, height);

    // gradient glow
    const g = ctx.createRadialGradient(
      width * (0.6 + tilt.x * 0.12),
      height * (0.2 + tilt.y * 0.12),
      0,
      width * 0.6,
      height * 0.6,
      Math.max(width, height)
    );
    g.addColorStop(0, 'rgba(124,58,237,0.15)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, width, height);

    // update and draw
    for (const p of particles) {
      p.x += p.vx + tilt.x * 0.35;
      p.y += p.vy + tilt.y * 0.35;
      if (p.x < -5) p.x = width + 5; if (p.x > width + 5) p.x = -5;
      if (p.y < -5) p.y = height + 5; if (p.y > height + 5) p.y = -5;

      const dx = p.x - pointer.x;
      const dy = p.y - pointer.y;
      const dist = Math.hypot(dx, dy);
      const force = Math.max(0, 100 - dist) / 100;
      p.x += (dx / (dist || 1)) * -force * 2.0;
      p.y += (dy / (dist || 1)) * -force * 2.0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(192,132,252,${p.a})`;
      ctx.fill();
    }

    requestAnimationFrame(step);
  }
  step();

  // expose tilt updates
  window.__setCanvasTilt = (tx, ty) => {
    tilt.x = tx; tilt.y = ty;
  };
})();

/* Device motion parallax + mouse fallback */
(() => {
  const parallaxItems = $$('.parallax');
  let usingMotion = false;

  const apply = (nx, ny) => {
    // nx, ny are -1..1
    const tx = nx * 16; // px translate
    const ty = ny * 12;
    parallaxItems.forEach((el) => {
      const depth = parseFloat(el.getAttribute('data-depth') || '0.2');
      el.style.transform = `translate3d(${tx * depth}px, ${ty * depth}px, 0)`;
    });
    if (typeof window.__setCanvasTilt === 'function') {
      window.__setCanvasTilt(nx, ny);
    }
  };

  // Mouse fallback
  window.addEventListener('mousemove', (e) => {
    if (usingMotion) return;
    const nx = (e.clientX / window.innerWidth) * 2 - 1;
    const ny = (e.clientY / window.innerHeight) * 2 - 1;
    apply(nx, ny);
  });

  // Motion
  async function enableMotion() {
    try {
      if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
        const res = await DeviceMotionEvent.requestPermission();
        if (res !== 'granted') return false;
      }
      window.addEventListener('deviceorientation', (e) => {
        usingMotion = true;
        const nx = (e.gamma || 0) / 45; // left-right
        const ny = (e.beta || 0) / 45; // front-back
        apply(nx, ny);
      });
      return true;
    } catch {
      return false;
    }
  }

  const btn = document.getElementById('enable-motion');
  if (btn) {
    btn.addEventListener('click', async () => {
      const ok = await enableMotion();
      if (ok) {
        btn.textContent = 'Motion Enabled';
        btn.disabled = true;
        btn.classList.add('active');
      } else {
        btn.textContent = 'Motion Unavailable';
      }
    });
  } else {
    enableMotion();
  }
})();

/* GSAP nice-to-haves */
(() => {
  if (!window.gsap) return;
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
  tl.from('.brand', { y: -16, opacity: 0, duration: 0.6 })
    .from('.headline', { y: 20, opacity: 0, duration: 0.7 }, '-=0.2')
    .from('.subhead', { y: 20, opacity: 0, duration: 0.6 }, '-=0.45')
    .from('.hero-cta .btn', { y: 10, opacity: 0, duration: 0.5, stagger: 0.1 }, '-=0.4')
    .from('.hero-stats .stat', { y: 10, opacity: 0, duration: 0.5, stagger: 0.08 }, '-=0.5');

  if (window.ScrollTrigger) {
    gsap.utils.toArray('.reveal').forEach((el) => {
      gsap.from(el, {
        scrollTrigger: { trigger: el, start: 'top 80%' },
        y: 18, opacity: 0, duration: 0.7, ease: 'power3.out'
      });
    });
  }
})();