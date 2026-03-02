(function () {
  const DPR = Math.max(1, window.devicePixelRatio || 1);

  function fitCanvas(canvas) {
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.max(1, Math.floor(rect.width * DPR));
    canvas.height = Math.max(1, Math.floor(rect.height * DPR));
    const ctx = canvas.getContext('2d');
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    return { width: rect.width, height: rect.height, ctx };
  }

  function initSparkleOverlay() {
    const canvas = document.getElementById('sparkle-overlay');
    if (!canvas) return;

    let state = fitCanvas(canvas);
    let stars = [];

    function createStars() {
      const count = Math.max(130, Math.floor((state.width * state.height) / 8500));
      const shades = [
        [255, 66, 208],
        [255, 92, 222],
        [255, 126, 227],
        [215, 92, 255],
      ];
      const shapes = ['dot', 'diamond', 'cross', 'ring'];
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * state.width,
        y: Math.random() * state.height,
        r: Math.random() * 1.7 + 0.3,
        alpha: Math.random() * 0.55 + 0.2,
        twinkle: Math.random() * 0.03 + 0.006,
        driftX: (Math.random() - 0.5) * 0.05,
        driftY: (Math.random() - 0.5) * 0.06,
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: Math.random() * 0.045 + 0.01,
        color: shades[Math.floor(Math.random() * shades.length)],
        shape: shapes[Math.floor(Math.random() * shapes.length)],
      }));
    }

    function drawSparkle(ctx, s) {
      const [r, g, b] = s.color;
      const pulseScale = 0.7 + 0.45 * Math.sin(s.pulse);
      const radius = Math.max(0.22, s.r * pulseScale);

      ctx.shadowBlur = 7 + radius * 5;
      ctx.shadowColor = `rgba(255, 66, 208, ${Math.min(0.95, s.alpha + 0.15)})`;

      if (s.shape === 'diamond') {
        ctx.beginPath();
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${s.alpha})`;
        ctx.moveTo(s.x, s.y - radius);
        ctx.lineTo(s.x + radius, s.y);
        ctx.lineTo(s.x, s.y + radius);
        ctx.lineTo(s.x - radius, s.y);
        ctx.closePath();
        ctx.fill();
        return;
      }

      if (s.shape === 'cross') {
        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${s.alpha})`;
        ctx.lineWidth = Math.max(0.6, radius * 0.55);
        ctx.beginPath();
        ctx.moveTo(s.x - radius, s.y);
        ctx.lineTo(s.x + radius, s.y);
        ctx.moveTo(s.x, s.y - radius);
        ctx.lineTo(s.x, s.y + radius);
        ctx.stroke();
        return;
      }

      if (s.shape === 'ring') {
        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${Math.max(0.15, s.alpha - 0.1)})`;
        ctx.lineWidth = Math.max(0.6, radius * 0.4);
        ctx.beginPath();
        ctx.arc(s.x, s.y, radius, 0, Math.PI * 2);
        ctx.stroke();
        return;
      }

      ctx.beginPath();
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${s.alpha})`;
      ctx.arc(s.x, s.y, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    function draw() {
      const ctx = state.ctx;
      ctx.clearRect(0, 0, state.width, state.height);

      for (const s of stars) {
        s.alpha += s.twinkle * (Math.random() > 0.5 ? 1 : -1);
        s.alpha = Math.max(0.06, Math.min(0.96, s.alpha));
        s.pulse += s.pulseSpeed;
        s.x += s.driftX;
        s.y += s.driftY;

        if (s.x < -6) s.x = state.width + 6;
        if (s.x > state.width + 6) s.x = -6;
        if (s.y < -5) s.y = state.height + 5;
        if (s.y > state.height + 5) s.y = -5;

        drawSparkle(ctx, s);
      }

      requestAnimationFrame(draw);
    }

    window.addEventListener('resize', () => {
      state = fitCanvas(canvas);
      createStars();
    });

    createStars();
    draw();
  }

  function initBrownianLayer() {
    const canvas = document.getElementById('brownian-overlay') || document.getElementById('brownian-canvas');
    if (!canvas) return;

    let state = fitCanvas(canvas);
    const walkers = [];
    const isOverlay = canvas.id === 'brownian-overlay';
    const nWalkers = isOverlay ? 120 : 26;
    const dt = 1;
    const sigma = isOverlay ? 1.1 : 1.75;

    for (let i = 0; i < nWalkers; i++) {
      walkers.push({
        x: state.width * (0.2 + Math.random() * 0.6),
        y: state.height * (0.2 + Math.random() * 0.6),
        trail: [],
        glow: 0.75 + Math.random() * 0.35,
      });
    }

    function step() {
      const ctx = state.ctx;
      ctx.fillStyle = isOverlay ? 'rgba(6, 4, 10, 0.04)' : 'rgba(6, 4, 10, 0.12)';
      ctx.fillRect(0, 0, state.width, state.height);

      walkers.forEach((w) => {
        const dx = sigma * Math.sqrt(dt) * (Math.random() - 0.5) * 2;
        const dy = sigma * Math.sqrt(dt) * (Math.random() - 0.5) * 2;

        w.x += dx;
        w.y += dy;

        if (w.x < 0 || w.x > state.width) w.x = Math.max(0, Math.min(state.width, w.x));
        if (w.y < 0 || w.y > state.height) w.y = Math.max(0, Math.min(state.height, w.y));

        w.trail.push({ x: w.x, y: w.y });
        if (w.trail.length > (isOverlay ? 20 : 34)) w.trail.shift();

        for (let i = 1; i < w.trail.length; i++) {
          const p0 = w.trail[i - 1];
          const p1 = w.trail[i];
          const alpha = i / w.trail.length;
          ctx.strokeStyle = `rgba(255, 82, 224, ${(isOverlay ? 0.03 + alpha * 0.2 : 0.05 + alpha * 0.45) * w.glow})`;
          ctx.lineWidth = isOverlay ? 0.72 : 1.2;
          ctx.shadowBlur = isOverlay ? 5 : 9;
          ctx.shadowColor = 'rgba(255, 66, 208, 0.5)';
          ctx.beginPath();
          ctx.moveTo(p0.x, p0.y);
          ctx.lineTo(p1.x, p1.y);
          ctx.stroke();
        }

        ctx.beginPath();
        ctx.fillStyle = `rgba(255, 112, 236, ${(isOverlay ? 0.78 : 0.9) * w.glow})`;
        ctx.shadowBlur = isOverlay ? 8 : 10;
        ctx.shadowColor = 'rgba(255, 78, 220, 0.85)';
        ctx.arc(w.x, w.y, isOverlay ? 0.9 : 1.35, 0, Math.PI * 2);
        ctx.fill();
      });

      requestAnimationFrame(step);
    }

    window.addEventListener('resize', () => {
      state = fitCanvas(canvas);
      walkers.forEach((w) => {
        w.x = state.width * (0.2 + Math.random() * 0.6);
        w.y = state.height * (0.2 + Math.random() * 0.6);
        w.trail = [];
      });
      state.ctx.clearRect(0, 0, state.width, state.height);
    });

    state.ctx.clearRect(0, 0, state.width, state.height);
    step();
  }

  function initFloatingBrownianCaption() {
    const caption = document.getElementById('brownian-floating-caption');
    if (!caption) return;

    let x = Math.max(20, Math.random() * (window.innerWidth - 280));
    let y = Math.max(20, Math.random() * (window.innerHeight - 80));
    let vx = 0.45;
    let vy = 0.3;

    function tick() {
      vx += (Math.random() - 0.5) * 0.06;
      vy += (Math.random() - 0.5) * 0.06;

      vx = Math.max(-1.25, Math.min(1.25, vx));
      vy = Math.max(-1.05, Math.min(1.05, vy));

      x += vx;
      y += vy;

      const maxX = Math.max(12, window.innerWidth - caption.offsetWidth - 12);
      const maxY = Math.max(12, window.innerHeight - caption.offsetHeight - 12);

      if (x < 12 || x > maxX) {
        vx *= -0.92;
        x = Math.max(12, Math.min(maxX, x));
      }
      if (y < 12 || y > maxY) {
        vy *= -0.92;
        y = Math.max(12, Math.min(maxY, y));
      }

      caption.style.transform = `translate(${x}px, ${y}px)`;
      requestAnimationFrame(tick);
    }

    window.addEventListener('resize', () => {
      x = Math.max(12, Math.min(window.innerWidth - caption.offsetWidth - 12, x));
      y = Math.max(12, Math.min(window.innerHeight - caption.offsetHeight - 12, y));
    });

    tick();
  }

  document.addEventListener('DOMContentLoaded', () => {
    initSparkleOverlay();
    initBrownianLayer();
    initFloatingBrownianCaption();
  });
})();
