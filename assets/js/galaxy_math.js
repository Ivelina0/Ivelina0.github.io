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
      const count = Math.max(45, Math.floor((state.width * state.height) / 18000));
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * state.width,
        y: Math.random() * state.height,
        r: Math.random() * 1.5 + 0.35,
        alpha: Math.random() * 0.5 + 0.2,
        twinkle: Math.random() * 0.02 + 0.004,
        drift: (Math.random() - 0.5) * 0.04,
      }));
    }

    function draw() {
      const ctx = state.ctx;
      ctx.clearRect(0, 0, state.width, state.height);

      for (const s of stars) {
        s.alpha += s.twinkle * (Math.random() > 0.5 ? 1 : -1);
        s.alpha = Math.max(0.08, Math.min(0.9, s.alpha));
        s.y += s.drift;

        if (s.y < -5) s.y = state.height + 5;
        if (s.y > state.height + 5) s.y = -5;

        ctx.beginPath();
        ctx.fillStyle = `rgba(255, 120, 230, ${s.alpha})`;
        ctx.shadowBlur = 10;
        ctx.shadowColor = 'rgba(255, 66, 208, 0.8)';
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
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
    const nWalkers = isOverlay ? 44 : 26;
    const dt = 1;
    const sigma = isOverlay ? 1.35 : 1.75;

    for (let i = 0; i < nWalkers; i++) {
      walkers.push({
        x: state.width * (0.2 + Math.random() * 0.6),
        y: state.height * (0.2 + Math.random() * 0.6),
        trail: [],
        hueShift: Math.random() * 35,
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
        if (w.trail.length > (isOverlay ? 42 : 34)) w.trail.shift();

        for (let i = 1; i < w.trail.length; i++) {
          const p0 = w.trail[i - 1];
          const p1 = w.trail[i];
          const alpha = i / w.trail.length;
          ctx.strokeStyle = `rgba(${255}, ${70 + w.hueShift}, ${205 + w.hueShift / 2}, ${0.05 + alpha * 0.45})`;
          ctx.lineWidth = isOverlay ? 1.0 : 1.2;
          ctx.shadowBlur = isOverlay ? 7 : 9;
          ctx.shadowColor = 'rgba(255, 66, 208, 0.5)';
          ctx.beginPath();
          ctx.moveTo(p0.x, p0.y);
          ctx.lineTo(p1.x, p1.y);
          ctx.stroke();
        }
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

  document.addEventListener('DOMContentLoaded', () => {
    initSparkleOverlay();
    initBrownianLayer();
  });
})();
