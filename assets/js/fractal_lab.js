const FRACTAL_PALETTE = [
  [0, 128, 128],
  [128, 128, 0],
  [128, 0, 128],
  [230, 0, 230],
  [128, 0, 64],
  [64, 0, 128],
  [184, 188, 224],
];

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}

function debounce(fn, delay = 100) {
  let timer = 0;
  return (...args) => {
    clearTimeout(timer);
    timer = window.setTimeout(() => fn(...args), delay);
  };
}

function paletteColor(t) {
  const tt = clamp(t, 0, 1);
  const x = Math.pow(tt, 0.78);

  const r = 0.52 + 0.48 * Math.cos(6.28318 * (x + 0.02));
  const g = 0.45 + 0.55 * Math.cos(6.28318 * (x + 0.23));
  const b = 0.52 + 0.48 * Math.cos(6.28318 * (x + 0.47));

  const boost = 0.12 + 0.2 * (1 - tt);

  return [
    Math.floor(255 * clamp(r + boost * 0.25, 0, 1)),
    Math.floor(255 * clamp(g + boost * 0.12, 0, 1)),
    Math.floor(255 * clamp(b + boost * 0.35, 0, 1)),
  ];
}

function getEscapeColor(iter, maxIter, zx, zy) {
  if (iter >= maxIter) return [17, 10, 30];

  const abs2 = Math.max(1.000001, zx * zx + zy * zy);
  const logZn = Math.log(abs2) * 0.5;
  const nu = Math.log(Math.max(logZn / Math.log(2), 1e-9)) / Math.log(2);
  const smoothIter = iter + 1 - nu;
  const t = clamp(smoothIter / maxIter, 0, 1);
  return paletteColor(t);
}

function resizeCanvasForDPR(canvas, targetHeight = 320) {
  const dpr = Math.max(1, window.devicePixelRatio || 1);
  const width = Math.max(1, Math.floor(canvas.clientWidth || 640));
  const cssHeight = canvas.clientHeight > 0 ? canvas.clientHeight : targetHeight;
  const height = Math.max(1, Math.floor(cssHeight));

  const nextWidth = Math.floor(width * dpr);
  const nextHeight = Math.floor(height * dpr);
  if (canvas.width !== nextWidth || canvas.height !== nextHeight) {
    canvas.width = nextWidth;
    canvas.height = nextHeight;
  }

  const ctx = canvas.getContext("2d", { alpha: false });
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  return { ctx, width, height, dpr };
}

function createRenderScheduler(renderFn) {
  let raf = 0;
  return () => {
    if (raf) return;
    raf = requestAnimationFrame(() => {
      raf = 0;
      renderFn();
    });
  };
}

function fitPointsToCanvas(points, width, height, padding = 24) {
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  for (const p of points) {
    if (p.x < minX) minX = p.x;
    if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y;
    if (p.y > maxY) maxY = p.y;
  }

  const spanX = Math.max(1e-9, maxX - minX);
  const spanY = Math.max(1e-9, maxY - minY);
  const usableW = Math.max(1, width - 2 * padding);
  const usableH = Math.max(1, height - 2 * padding);
  const scale = Math.min(usableW / spanX, usableH / spanY);
  const drawW = spanX * scale;
  const drawH = spanY * scale;
  const offsetX = (width - drawW) * 0.5 - minX * scale;
  const offsetY = (height - drawH) * 0.5 - minY * scale;

  return {
    scale,
    map(point) {
      return {
        x: point.x * scale + offsetX,
        y: point.y * scale + offsetY,
      };
    },
  };
}

function bindPanZoom(canvas, state, scheduleRender) {
  function pixelToComplex(px, py, width, height) {
    const aspect = width / height;
    return {
      x: state.centerX + ((px / width) - 0.5) * state.scale * aspect,
      y: state.centerY + ((py / height) - 0.5) * state.scale,
    };
  }

  canvas.addEventListener("wheel", (e) => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    const before = pixelToComplex(px, py, rect.width, rect.height);

    const zoom = e.deltaY < 0 ? 0.92 : 1.09;
    state.scale = clamp(state.scale * zoom, 0.000001, 10);

    const after = pixelToComplex(px, py, rect.width, rect.height);
    state.centerX += before.x - after.x;
    state.centerY += before.y - after.y;
    scheduleRender();
  }, { passive: false });

  canvas.addEventListener("mousedown", (e) => {
    state.dragging = true;
    state.dragStartX = e.clientX;
    state.dragStartY = e.clientY;
    state.dragCenterX = state.centerX;
    state.dragCenterY = state.centerY;
    canvas.classList.add("is-dragging");
  });

  window.addEventListener("mousemove", (e) => {
    if (!state.dragging) return;
    const rect = canvas.getBoundingClientRect();
    const dx = e.clientX - state.dragStartX;
    const dy = e.clientY - state.dragStartY;
    const aspect = rect.width / rect.height;

    state.centerX = state.dragCenterX - (dx / rect.width) * state.scale * aspect;
    state.centerY = state.dragCenterY - (dy / rect.height) * state.scale;
    scheduleRender();
  });

  window.addEventListener("mouseup", () => {
    if (!state.dragging) return;
    state.dragging = false;
    canvas.classList.remove("is-dragging");
  });
}

function bindScreenPanZoom(canvas, state, scheduleRender, options = {}) {
  const minZoom = options.minZoom ?? 0.6;
  const maxZoom = options.maxZoom ?? 8;

  canvas.addEventListener("wheel", (e) => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const cx = rect.width * 0.5;
    const cy = rect.height * 0.5;

    const oldZoom = state.userZoom;
    const nextZoom = clamp(oldZoom * (e.deltaY < 0 ? 1.1 : 0.91), minZoom, maxZoom);
    const ratio = nextZoom / oldZoom;

    state.panX = (mx - cx) - ((mx - cx - state.panX) * ratio);
    state.panY = (my - cy) - ((my - cy - state.panY) * ratio);
    state.userZoom = nextZoom;

    scheduleRender();
  }, { passive: false });

  canvas.addEventListener("mousedown", (e) => {
    state.dragging = true;
    state.dragStartX = e.clientX;
    state.dragStartY = e.clientY;
    state.dragPanX = state.panX;
    state.dragPanY = state.panY;
    canvas.classList.add("is-dragging");
  });

  window.addEventListener("mousemove", (e) => {
    if (!state.dragging) return;
    state.panX = state.dragPanX + (e.clientX - state.dragStartX);
    state.panY = state.dragPanY + (e.clientY - state.dragStartY);
    scheduleRender();
  });

  window.addEventListener("mouseup", () => {
    if (!state.dragging) return;
    state.dragging = false;
    canvas.classList.remove("is-dragging");
  });
}

function startProgressiveEscapeRender(canvas, state, mode = "mandelbrot", options = {}) {
  const token = (canvas.__renderToken || 0) + 1;
  canvas.__renderToken = token;

  const { ctx, width, height } = resizeCanvasForDPR(canvas, 330);
  const image = ctx.createImageData(width, height);
  const data = image.data;
  const aspect = width / height;

  const passBlocks = options.passes || [8, 4, 2, 1];
  const iterScale = options.iterScale || 1;
  const effectiveMaxIter = Math.max(40, Math.floor(state.maxIter * iterScale));
  const budget = options.budget || 26000;
  let passIndex = 0;
  let y = 0;
  let x = 0;

  function samplePixel(px, py) {
    const re = state.centerX + ((px / width) - 0.5) * state.scale * aspect;
    const im = state.centerY + ((py / height) - 0.5) * state.scale;

    let zx = mode === "mandelbrot" ? 0 : re;
    let zy = mode === "mandelbrot" ? 0 : im;
    const cRe = mode === "mandelbrot" ? re : state.cRe;
    const cIm = mode === "mandelbrot" ? im : state.cIm;

    let iter = 0;
    while (iter < effectiveMaxIter) {
      const zx2 = zx * zx - zy * zy + cRe;
      const zy2 = 2 * zx * zy + cIm;
      zx = zx2;
      zy = zy2;
      if (zx * zx + zy * zy > 4) break;
      iter++;
    }

    return getEscapeColor(iter, effectiveMaxIter, zx, zy);
  }

  function paintBlock(px, py, block, color) {
    const xEnd = Math.min(width, px + block);
    const yEnd = Math.min(height, py + block);

    for (let yy = py; yy < yEnd; yy++) {
      const rowOffset = yy * width * 4;
      for (let xx = px; xx < xEnd; xx++) {
        const idx = rowOffset + xx * 4;
        data[idx] = color[0];
        data[idx + 1] = color[1];
        data[idx + 2] = color[2];
        data[idx + 3] = 255;
      }
    }
  }

  function step() {
    if (canvas.__renderToken !== token) return;

    const block = passBlocks[passIndex];
    let work = 0;

    while (y < height && work < budget) {
      const color = samplePixel(x, y);
      paintBlock(x, y, block, color);
      work += block * block;

      x += block;
      if (x >= width) {
        x = 0;
        y += block;
      }
    }

    ctx.putImageData(image, 0, 0);

    if (y < height) {
      requestAnimationFrame(step);
      return;
    }

    passIndex += 1;
    if (passIndex < passBlocks.length) {
      x = 0;
      y = 0;
      requestAnimationFrame(step);
    }
  }

  requestAnimationFrame(step);
}

function renderEscapeFractal(canvas, state, mode = "mandelbrot") {
  const token = (canvas.__renderToken || 0) + 1;
  canvas.__renderToken = token;

  const { ctx, width, height } = resizeCanvasForDPR(canvas, 330);
  const image = ctx.createImageData(width, height);
  const data = image.data;
  const aspect = width / height;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const re = state.centerX + ((x / width) - 0.5) * state.scale * aspect;
      const im = state.centerY + ((y / height) - 0.5) * state.scale;

      let zx = mode === "mandelbrot" ? 0 : re;
      let zy = mode === "mandelbrot" ? 0 : im;
      const cRe = mode === "mandelbrot" ? re : state.cRe;
      const cIm = mode === "mandelbrot" ? im : state.cIm;

      let iter = 0;
      while (iter < state.maxIter) {
        const zx2 = zx * zx - zy * zy + cRe;
        const zy2 = 2 * zx * zy + cIm;
        zx = zx2;
        zy = zy2;
        if (zx * zx + zy * zy > 4) break;
        iter++;
      }

      const [r, g, b] = getEscapeColor(iter, state.maxIter, zx, zy);
      const idx = (y * width + x) * 4;
      data[idx] = r;
      data[idx + 1] = g;
      data[idx + 2] = b;
      data[idx + 3] = 255;
    }
  }

  ctx.putImageData(image, 0, 0);
}

function initMandelbrot() {
  const canvas = document.getElementById("mandelbrot-canvas");
  if (!canvas) return;

  const iterInput = document.getElementById("mandelbrot-iterations");
  const iterValue = document.getElementById("mandelbrot-iterations-value");
  const resetBtn = document.getElementById("mandelbrot-reset");
  const animateBtn = document.getElementById("mandelbrot-animate");

  const state = {
    centerX: -0.55,
    centerY: 0,
    scale: 3.2,
    maxIter: Number(iterInput?.value || 220),
    dragging: false,
    dragStartX: 0,
    dragStartY: 0,
    dragCenterX: -0.55,
    dragCenterY: 0,
  };

  function render() {
    startProgressiveEscapeRender(canvas, state, "mandelbrot", {
      passes: [4, 2, 1],
      iterScale: 1,
      budget: 22000,
    });
  }

  function renderPreview() {
    startProgressiveEscapeRender(canvas, state, "mandelbrot", {
      passes: [10, 5],
      iterScale: 0.5,
      budget: 15000,
    });
  }

  const scheduleRender = createRenderScheduler(render);
  const schedulePreview = createRenderScheduler(renderPreview);
  const debouncedRender = debounce(scheduleRender, 110);
  let hqTimer = 0;
  let animRaf = 0;

  const presets = [
    { centerX: -0.55, centerY: 0, scale: 3.2 },
    { centerX: -0.7436438870371587, centerY: 0.13182590420531197, scale: 0.015 },
    { centerX: -0.748, centerY: 0.1, scale: 0.008 },
    { centerX: -0.1011, centerY: 0.9563, scale: 0.04 },
    { centerX: -0.55, centerY: 0, scale: 3.2 },
  ];

  function queueHQ(delay = 130) {
    clearTimeout(hqTimer);
    hqTimer = window.setTimeout(() => {
      scheduleRender();
    }, delay);
  }

  function stopAnimation() {
    if (!animRaf) return;
    cancelAnimationFrame(animRaf);
    animRaf = 0;
    if (animateBtn) animateBtn.textContent = "Animate";
  }

  function easeInOut(t) {
    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  }

  function animateTour() {
    if (animRaf) {
      stopAnimation();
      queueHQ(20);
      return;
    }

    let segment = 0;
    let start = 0;
    if (animateBtn) animateBtn.textContent = "Stop";

    const duration = 2600;

    function frame(ts) {
      if (!start) start = ts;
      const a = presets[segment];
      const b = presets[segment + 1];
      const t = clamp((ts - start) / duration, 0, 1);
      const e = easeInOut(t);

      state.centerX = lerp(a.centerX, b.centerX, e);
      state.centerY = lerp(a.centerY, b.centerY, e);
      state.scale = lerp(a.scale, b.scale, e);

      schedulePreview();

      if (t >= 1) {
        segment += 1;
        start = ts;
        if (segment >= presets.length - 1) {
          stopAnimation();
          queueHQ(10);
          return;
        }
      }

      animRaf = requestAnimationFrame(frame);
    }

    animRaf = requestAnimationFrame(frame);
  }

  function resetView() {
    stopAnimation();
    state.centerX = -0.55;
    state.centerY = 0;
    state.scale = 3.2;
    queueHQ(20);
  }

  iterValue.textContent = String(state.maxIter);

  iterInput?.addEventListener("input", () => {
    stopAnimation();
    state.maxIter = Number(iterInput.value);
    iterValue.textContent = String(state.maxIter);
    schedulePreview();
    debouncedRender();
  });

  iterInput?.addEventListener("change", scheduleRender);

  resetBtn?.addEventListener("click", resetView);
  animateBtn?.addEventListener("click", animateTour);

  bindPanZoom(canvas, state, () => {
    if (animRaf) stopAnimation();
    schedulePreview();
    queueHQ(140);
  });

  window.addEventListener("resize", scheduleRender);
  scheduleRender();
}

function initJulia() {
  const canvas = document.getElementById("julia-canvas");
  if (!canvas) return;

  const reInput = document.getElementById("julia-re");
  const imInput = document.getElementById("julia-im");
  const resetBtn = document.getElementById("julia-reset");
  const animateBtn = document.getElementById("julia-animate");
  const reValue = document.getElementById("julia-re-value");
  const imValue = document.getElementById("julia-im-value");

  const state = {
    cRe: Number(reInput?.value || -0.79),
    cIm: Number(imInput?.value || 0.15),
    maxIter: 220,
    centerX: 0,
    centerY: 0,
    scale: 3,
    dragging: false,
    dragStartX: 0,
    dragStartY: 0,
    dragCenterX: 0,
    dragCenterY: 0,
  };

  function render() {
    startProgressiveEscapeRender(canvas, state, "julia", {
      passes: [4, 2, 1],
      iterScale: 1,
      budget: 22000,
    });
  }

  function renderPreview() {
    startProgressiveEscapeRender(canvas, state, "julia", {
      passes: [10, 5],
      iterScale: 0.5,
      budget: 15000,
    });
  }

  const scheduleRender = createRenderScheduler(render);
  const schedulePreview = createRenderScheduler(renderPreview);
  const debouncedRender = debounce(scheduleRender, 110);
  let hqTimer = 0;
  let animRaf = 0;
  let animStart = 0;

  function queueHQ(delay = 130) {
    clearTimeout(hqTimer);
    hqTimer = window.setTimeout(() => {
      scheduleRender();
    }, delay);
  }

  function stopAnimation() {
    if (!animRaf) return;
    cancelAnimationFrame(animRaf);
    animRaf = 0;
    animStart = 0;
    if (animateBtn) animateBtn.textContent = "Animate";
  }

  function syncInputs() {
    if (reInput) reInput.value = state.cRe.toFixed(2);
    if (imInput) imInput.value = state.cIm.toFixed(2);
  }

  function animateJulia() {
    if (animRaf) {
      stopAnimation();
      queueHQ(20);
      return;
    }

    const baseRe = state.cRe;
    const baseIm = state.cIm;
    const baseScale = state.scale;
    if (animateBtn) animateBtn.textContent = "Stop";

    function frame(ts) {
      if (!animStart) animStart = ts;
      const t = (ts - animStart) * 0.001;

      state.cRe = clamp(baseRe + 0.09 * Math.cos(0.8 * t), -1.2, 1.2);
      state.cIm = clamp(baseIm + 0.09 * Math.sin(0.8 * t), -1.2, 1.2);
      state.scale = clamp(baseScale * (1 - 0.08 * Math.sin(0.45 * t)), 0.05, 10);

      syncLabels();
      syncInputs();
      schedulePreview();
      animRaf = requestAnimationFrame(frame);
    }

    animRaf = requestAnimationFrame(frame);
  }

  function syncLabels() {
    reValue.textContent = state.cRe.toFixed(2);
    imValue.textContent = state.cIm.toFixed(2);
  }

  function resetView() {
    stopAnimation();
    state.centerX = 0;
    state.centerY = 0;
    state.scale = 3;
    queueHQ(20);
  }

  reInput?.addEventListener("input", () => {
    stopAnimation();
    state.cRe = Number(reInput.value);
    syncLabels();
    schedulePreview();
    debouncedRender();
  });

  imInput?.addEventListener("input", () => {
    stopAnimation();
    state.cIm = Number(imInput.value);
    syncLabels();
    schedulePreview();
    debouncedRender();
  });

  reInput?.addEventListener("change", scheduleRender);
  imInput?.addEventListener("change", scheduleRender);

  resetBtn?.addEventListener("click", resetView);
  animateBtn?.addEventListener("click", animateJulia);

  bindPanZoom(canvas, state, () => {
    if (animRaf) stopAnimation();
    schedulePreview();
    queueHQ(140);
  });

  window.addEventListener("resize", scheduleRender);
  syncLabels();
  scheduleRender();
}

function initKoch() {
  const canvas = document.getElementById("koch-canvas");
  if (!canvas) return;

  const depthInput = document.getElementById("koch-depth");
  const depthValue = document.getElementById("koch-depth-value");
  const animateBtn = document.getElementById("koch-animate");

  let depth = Number(depthInput?.value || 4);
  let animRaf = 0;
  let stepTimer = 0;

  function subdivide(a, b, level, outSegments) {
    if (level === 0) {
      outSegments.push([a, b]);
      return;
    }

    const dx = (b.x - a.x) / 3;
    const dy = (b.y - a.y) / 3;
    const p1 = { x: a.x + dx, y: a.y + dy };
    const p2 = { x: a.x + 2 * dx, y: a.y + 2 * dy };

    const angle = -Math.PI / 3;
    const vx = p2.x - p1.x;
    const vy = p2.y - p1.y;
    const peak = {
      x: p1.x + vx * Math.cos(angle) - vy * Math.sin(angle),
      y: p1.y + vx * Math.sin(angle) + vy * Math.cos(angle),
    };

    subdivide(a, p1, level - 1, outSegments);
    subdivide(p1, peak, level - 1, outSegments);
    subdivide(peak, p2, level - 1, outSegments);
    subdivide(p2, b, level - 1, outSegments);
  }

  function buildGeometry() {
    const half = 0.5;
    const h = Math.sqrt(3) / 2;
    const pA = { x: 0, y: -h / 2 };
    const pB = { x: half, y: h / 2 };
    const pC = { x: -half, y: h / 2 };
    const segments = [];

    subdivide(pA, pB, depth, segments);
    subdivide(pB, pC, depth, segments);
    subdivide(pC, pA, depth, segments);

    const points = [];
    for (const [s, e] of segments) {
      points.push(s, e);
    }
    return { segments, points };
  }

  function render() {
    const { ctx, width, height } = resizeCanvasForDPR(canvas, 320);
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#050308";
    ctx.fillRect(0, 0, width, height);

    const { segments, points } = buildGeometry();
    const fit = fitPointsToCanvas(points, width, height, 26);

    ctx.strokeStyle = "rgba(236, 126, 220, 0.95)";
    ctx.lineWidth = 1.1;
    ctx.shadowBlur = 10;
    ctx.shadowColor = "rgba(255, 66, 208, 0.25)";

    ctx.beginPath();
    for (const [s, e] of segments) {
      const a = fit.map(s);
      const b = fit.map(e);
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
    }
    ctx.stroke();
  }

  const scheduleRender = createRenderScheduler(render);
  const debouncedRender = debounce(scheduleRender, 70);

  function stopAnimation() {
    if (!animRaf) return;
    cancelAnimationFrame(animRaf);
    animRaf = 0;
    if (animateBtn) animateBtn.textContent = "Animate";
  }

  function animateToTarget() {
    if (animRaf) {
      stopAnimation();
      return;
    }

    const target = depth;
    let current = 0;
    if (animateBtn) animateBtn.textContent = "Stop";

    function frame(ts) {
      if (!stepTimer) stepTimer = ts;
      if (ts - stepTimer >= 190) {
        stepTimer = ts;
        current += 1;
        depth = Math.min(current, target);
        if (depthInput) depthInput.value = String(depth);
        depthValue.textContent = String(depth);
        scheduleRender();
      }

      if (current >= target) {
        stopAnimation();
        stepTimer = 0;
        return;
      }

      animRaf = requestAnimationFrame(frame);
    }

    animRaf = requestAnimationFrame(frame);
  }

  depthValue.textContent = String(depth);

  depthInput?.addEventListener("input", () => {
    stopAnimation();
    depth = Number(depthInput.value);
    depthValue.textContent = String(depth);
    debouncedRender();
  });

  depthInput?.addEventListener("change", scheduleRender);
  animateBtn?.addEventListener("click", animateToTarget);

  window.addEventListener("resize", scheduleRender);
  scheduleRender();
}

function initDragon() {
  const canvas = document.getElementById("dragon-canvas");
  if (!canvas) return;

  const depthInput = document.getElementById("dragon-depth");
  const depthValue = document.getElementById("dragon-depth-value");
  const resetBtn = document.getElementById("dragon-reset");
  const animateBtn = document.getElementById("dragon-animate");

  const state = {
    depth: Number(depthInput?.value || 11),
  };

  let animationTimer = 0;
  const curveCache = new Map();

  function buildDragon(depth) {
    if (curveCache.has(depth)) return curveCache.get(depth);

    let points = [{ x: 0, y: 0 }, { x: 1, y: 0 }];

    for (let d = 1; d <= depth; d++) {
      const pivot = points[points.length - 1];
      const next = points.slice();

      for (let i = points.length - 2; i >= 0; i--) {
        const p = points[i];
        const dx = p.x - pivot.x;
        const dy = p.y - pivot.y;
        next.push({
          x: pivot.x - dy,
          y: pivot.y + dx,
        });
      }

      points = next;
    }

    curveCache.set(depth, points);
    return points;
  }

  function drawCurve(points) {
    const { ctx, width, height } = resizeCanvasForDPR(canvas, 330);
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#050308";
    ctx.fillRect(0, 0, width, height);

    const fit = fitPointsToCanvas(points, width, height, 28);

    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.strokeStyle = "rgba(224, 138, 230, 0.9)";
    ctx.lineWidth = 1.2;
    ctx.shadowBlur = 8;
    ctx.shadowColor = "rgba(224, 138, 230, 0.24)";

    ctx.beginPath();
    const first = fit.map(points[0]);
    ctx.moveTo(first.x, first.y);

    for (let i = 1; i < points.length; i++) {
      const p = fit.map(points[i]);
      ctx.lineTo(p.x, p.y);
    }
    ctx.stroke();
  }

  function render() {
    drawCurve(buildDragon(state.depth));
  }

  const scheduleRender = createRenderScheduler(render);
  const debouncedRender = debounce(scheduleRender, 70);

  function syncLabel() {
    if (depthValue) depthValue.textContent = String(state.depth);
  }

  function stopAnimation() {
    if (animationTimer) {
      clearInterval(animationTimer);
      animationTimer = 0;
      if (animateBtn) animateBtn.textContent = "Animate";
    }
  }

  function animateToTarget() {
    if (animationTimer) {
      stopAnimation();
      return;
    }
    const target = state.depth;
    let current = 1;
    state.depth = current;
    if (depthInput) depthInput.value = String(current);
    syncLabel();
    scheduleRender();

    if (animateBtn) animateBtn.textContent = "Stop";
    animationTimer = window.setInterval(() => {
      current += 1;
      if (current > target) {
        stopAnimation();
        return;
      }
      state.depth = current;
      if (depthInput) depthInput.value = String(current);
      syncLabel();
      scheduleRender();
    }, 130);
  }

  depthInput?.addEventListener("input", () => {
    state.depth = Number(depthInput.value);
    syncLabel();
    debouncedRender();
  });

  depthInput?.addEventListener("change", scheduleRender);

  resetBtn?.addEventListener("click", () => {
    stopAnimation();
    state.depth = 11;
    if (depthInput) depthInput.value = "11";
    syncLabel();
    scheduleRender();
  });

  animateBtn?.addEventListener("click", animateToTarget);

  window.addEventListener("resize", scheduleRender);
  syncLabel();
  scheduleRender();
}

function initHilbert() {
  const canvas = document.getElementById("hilbert-canvas");
  if (!canvas) return;

  const orderInput = document.getElementById("hilbert-order");
  const orderValue = document.getElementById("hilbert-order-value");
  const resetBtn = document.getElementById("hilbert-reset");
  const animateBtn = document.getElementById("hilbert-animate");

  const state = {
    order: Number(orderInput?.value || 5),
  };

  let animationTimer = 0;
  const curveCache = new Map();

  function buildHilbert(order) {
    if (curveCache.has(order)) return curveCache.get(order);

    const points = [{ x: 0, y: 0 }];
    let dir = 0;
    let x = 0;
    let y = 0;

    function forward() {
      x += Math.cos(dir);
      y += Math.sin(dir);
      points.push({ x, y });
    }

    function turnLeft() {
      dir -= Math.PI / 2;
    }

    function turnRight() {
      dir += Math.PI / 2;
    }

    function hilbert(level, sign) {
      if (level === 0) return;

      if (sign > 0) turnRight();
      else turnLeft();

      hilbert(level - 1, -sign);
      forward();

      if (sign > 0) turnLeft();
      else turnRight();

      hilbert(level - 1, sign);
      forward();
      hilbert(level - 1, sign);

      if (sign > 0) turnLeft();
      else turnRight();

      forward();
      hilbert(level - 1, -sign);

      if (sign > 0) turnRight();
      else turnLeft();
    }

    hilbert(order, 1);
    curveCache.set(order, points);
    return points;
  }

  function drawCurve(points) {
    const { ctx, width, height } = resizeCanvasForDPR(canvas, 330);
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#050308";
    ctx.fillRect(0, 0, width, height);

    const fit = fitPointsToCanvas(points, width, height, 30);

    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.strokeStyle = "rgba(132, 220, 234, 0.9)";
    ctx.lineWidth = 1.1;
    ctx.shadowBlur = 8;
    ctx.shadowColor = "rgba(132, 220, 234, 0.22)";

    ctx.beginPath();
    const first = fit.map(points[0]);
    ctx.moveTo(first.x, first.y);

    for (let i = 1; i < points.length; i++) {
      const p = fit.map(points[i]);
      ctx.lineTo(p.x, p.y);
    }
    ctx.stroke();
  }

  function render() {
    drawCurve(buildHilbert(state.order));
  }

  const scheduleRender = createRenderScheduler(render);
  const debouncedRender = debounce(scheduleRender, 70);

  function syncLabel() {
    if (orderValue) orderValue.textContent = String(state.order);
  }

  function stopAnimation() {
    if (animationTimer) {
      clearInterval(animationTimer);
      animationTimer = 0;
      if (animateBtn) animateBtn.textContent = "Animate";
    }
  }

  function animateToTarget() {
    if (animationTimer) {
      stopAnimation();
      return;
    }
    const target = state.order;
    let current = 1;
    state.order = current;
    if (orderInput) orderInput.value = String(current);
    syncLabel();
    scheduleRender();

    if (animateBtn) animateBtn.textContent = "Stop";
    animationTimer = window.setInterval(() => {
      current += 1;
      if (current > target) {
        stopAnimation();
        return;
      }
      state.order = current;
      if (orderInput) orderInput.value = String(current);
      syncLabel();
      scheduleRender();
    }, 180);
  }

  orderInput?.addEventListener("input", () => {
    state.order = Number(orderInput.value);
    syncLabel();
    debouncedRender();
  });

  orderInput?.addEventListener("change", scheduleRender);

  resetBtn?.addEventListener("click", () => {
    stopAnimation();
    state.order = 5;
    if (orderInput) orderInput.value = "5";
    syncLabel();
    scheduleRender();
  });

  animateBtn?.addEventListener("click", animateToTarget);

  window.addEventListener("resize", scheduleRender);
  syncLabel();
  scheduleRender();
}

function initBarnsley() {
  const canvas = document.getElementById("barnsley-canvas");
  if (!canvas) return;

  const regenerateBtn = document.getElementById("barnsley-regenerate");
  const animateBtn = document.getElementById("barnsley-animate");
  const pointsInput = document.getElementById("barnsley-points");
  const pointsValue = document.getElementById("barnsley-points-value");
  const zoomInput = document.getElementById("barnsley-zoom");
  const zoomValue = document.getElementById("barnsley-zoom-value");

  const state = {
    pointCount: Number(pointsInput?.value || 50000),
    zoom: Number(zoomInput?.value || 1),
    userZoom: 1,
    panX: 0,
    panY: 0,
    dragging: false,
    dragStartX: 0,
    dragStartY: 0,
    dragPanX: 0,
    dragPanY: 0,
    points: [],
    isAnimating: false,
    revealCount: 0,
  };
  let animRaf = 0;

  function generatePoints() {
    let x = (Math.random() - 0.5) * 0.4;
    let y = (Math.random() - 0.5) * 0.4;
    const out = [];

    const burnIn = 90;
    const total = state.pointCount + burnIn;

    for (let i = 0; i < total; i++) {
      const r = Math.random() * 100;
      let nx;
      let ny;

      if (r < 1) {
        nx = 0;
        ny = 0.16 * y;
      } else if (r < 86) {
        nx = 0.85 * x + 0.04 * y;
        ny = -0.04 * x + 0.85 * y + 1.6;
      } else if (r < 93) {
        nx = 0.2 * x - 0.26 * y;
        ny = 0.23 * x + 0.22 * y + 1.6;
      } else {
        nx = -0.15 * x + 0.28 * y;
        ny = 0.26 * x + 0.24 * y + 0.44;
      }

      x = nx;
      y = ny;
      if (i >= burnIn) out.push({ x, y });
    }

    state.points = out;
  }

  function draw() {
    if (!state.points.length) generatePoints();

    const { ctx, width, height } = resizeCanvasForDPR(canvas, 330);
    ctx.clearRect(0, 0, width, height);
    const bgGrad = ctx.createRadialGradient(
      width * 0.5,
      height * 0.3,
      20,
      width * 0.5,
      height * 0.5,
      Math.max(width, height)
    );
    bgGrad.addColorStop(0, "rgba(20, 14, 33, 1)");
    bgGrad.addColorStop(1, "rgba(5, 3, 8, 1)");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    const fit = fitPointsToCanvas(state.points, width, height, 22);
    const centerX = width * 0.5;
    const centerY = height * 0.5;
    const localZoom = state.zoom * state.userZoom;
    const image = ctx.createImageData(width, height);
    const data = image.data;

    const drawCount = state.isAnimating ? Math.min(state.revealCount, state.points.length) : state.points.length;

    for (let i = 0; i < drawCount; i++) {
      const p = state.points[i];
      const mapped = fit.map(p);
      const px = centerX + (mapped.x - centerX) * localZoom + state.panX;
      const py = centerY + (mapped.y - centerY) * localZoom + state.panY;
      const x = Math.round(px);
      const y = Math.round(py);

      if (x < 0 || x >= width || y < 0 || y >= height) continue;

      const t = clamp(py / height, 0, 1);
      const r = Math.floor(40 + 60 * (1 - t));
      const g = Math.floor(165 + 75 * (1 - t));
      const b = Math.floor(90 + 40 * t);
      const idx = (y * width + x) * 4;

      data[idx] = Math.min(255, data[idx] + r);
      data[idx + 1] = Math.min(255, data[idx + 1] + g);
      data[idx + 2] = Math.min(255, data[idx + 2] + b);
      data[idx + 3] = 255;
    }

    ctx.putImageData(image, 0, 0);

    ctx.globalCompositeOperation = "screen";
    ctx.strokeStyle = "rgba(92, 240, 162, 0.22)";
    ctx.lineWidth = 1;
    ctx.shadowBlur = 8;
    ctx.shadowColor = "rgba(96, 240, 168, 0.2)";
    ctx.strokeRect(0.5, 0.5, width - 1, height - 1);
    ctx.globalCompositeOperation = "source-over";
  }

  const scheduleDraw = createRenderScheduler(draw);
  const debouncedRegenerate = debounce(() => {
    generatePoints();
    scheduleDraw();
  }, 100);

  function syncLabels() {
    pointsValue.textContent = String(state.pointCount);
    zoomValue.textContent = state.zoom.toFixed(2);
  }

  function stopAnimation() {
    if (!animRaf) return;
    cancelAnimationFrame(animRaf);
    animRaf = 0;
    state.isAnimating = false;
    state.revealCount = state.points.length;
    if (animateBtn) animateBtn.textContent = "Animate";
    scheduleDraw();
  }

  function startAnimation() {
    if (animRaf) {
      stopAnimation();
      return;
    }

    state.isAnimating = true;
    state.revealCount = 50;
    if (animateBtn) animateBtn.textContent = "Stop";

    const step = Math.max(120, Math.floor(state.pointCount / 120));

    function frame() {
      state.revealCount = Math.min(state.revealCount + step, state.points.length);
      scheduleDraw();

      if (state.revealCount >= state.points.length) {
        state.isAnimating = false;
        animRaf = 0;
        if (animateBtn) animateBtn.textContent = "Animate";
        return;
      }

      animRaf = requestAnimationFrame(frame);
    }

    animRaf = requestAnimationFrame(frame);
  }

  regenerateBtn?.addEventListener("click", () => {
    stopAnimation();
    generatePoints();
    scheduleDraw();
  });

  pointsInput?.addEventListener("input", () => {
    stopAnimation();
    state.pointCount = Number(pointsInput.value);
    syncLabels();
    debouncedRegenerate();
  });

  pointsInput?.addEventListener("change", () => {
    stopAnimation();
    state.pointCount = Number(pointsInput.value);
    syncLabels();
    generatePoints();
    scheduleDraw();
  });

  zoomInput?.addEventListener("input", () => {
    state.zoom = Number(zoomInput.value);
    syncLabels();
    scheduleDraw();
  });

  animateBtn?.addEventListener("click", startAnimation);

  bindScreenPanZoom(canvas, state, scheduleDraw, { minZoom: 0.55, maxZoom: 8 });

  canvas.addEventListener("dblclick", () => {
    state.userZoom = 1;
    state.panX = 0;
    state.panY = 0;
    scheduleDraw();
  });

  window.addEventListener("resize", scheduleDraw);
  syncLabels();
  generatePoints();
  scheduleDraw();
}

function initBrownian() {
  const canvas = document.getElementById("brownian-canvas");
  if (!canvas) return;

  const redrawBtn = document.getElementById("brownian-redraw");
  const animateBtn = document.getElementById("brownian-animate");
  const stepsInput = document.getElementById("brownian-steps");
  const stepsValue = document.getElementById("brownian-steps-value");
  const stepSizeInput = document.getElementById("brownian-step-size");
  const stepSizeValue = document.getElementById("brownian-step-size-value");

  const state = {
    steps: Number(stepsInput?.value || 1200),
    stepSize: Number(stepSizeInput?.value || 1.7),
    userZoom: 1,
    panX: 0,
    panY: 0,
    dragging: false,
    dragStartX: 0,
    dragStartY: 0,
    dragPanX: 0,
    dragPanY: 0,
    paths: [],
    isAnimating: false,
    revealRatio: 1,
  };
  let animRaf = 0;

  function generatePaths() {
    const nPaths = 9;
    const paths = [];
    for (let p = 0; p < nPaths; p++) {
      const points = [{ x: 0, y: 0 }];
      let x = 0;
      let y = 0;

      const localStep = state.stepSize * (0.82 + 0.36 * Math.random());

      for (let i = 0; i < state.steps; i++) {
        x += (Math.random() - 0.5) * 2 * localStep;
        y += (Math.random() - 0.5) * 2 * localStep;
        points.push({ x, y });
      }

      paths.push(points);
    }
    state.paths = paths;
  }

  function draw() {
    if (!state.paths.length) generatePaths();

    const { ctx, width, height } = resizeCanvasForDPR(canvas, 330);
    ctx.clearRect(0, 0, width, height);
    const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
    bgGrad.addColorStop(0, "rgba(17, 11, 28, 1)");
    bgGrad.addColorStop(1, "rgba(5, 3, 8, 1)");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    const all = [];
    for (const path of state.paths) {
      for (const p of path) all.push(p);
    }
    const fit = fitPointsToCanvas(all, width, height, 24);

    const cx = width * 0.5;
    const cy = height * 0.5;

    function transform(point) {
      const base = fit.map(point);
      return {
        x: cx + (base.x - cx) * state.userZoom + state.panX,
        y: cy + (base.y - cy) * state.userZoom + state.panY,
      };
    }

    ctx.lineJoin = "round";
    ctx.lineCap = "round";

    state.paths.forEach((path, index) => {
      const [r, g, b] = FRACTAL_PALETTE[index % FRACTAL_PALETTE.length];
      const start = transform(path[0]);
      const maxIdx = state.isAnimating
        ? Math.max(2, Math.floor((path.length - 1) * state.revealRatio))
        : path.length - 1;

      ctx.beginPath();
      ctx.moveTo(start.x, start.y);

      for (let i = 1; i <= maxIdx; i++) {
        const mapped = transform(path[i]);
        ctx.lineTo(mapped.x, mapped.y);
      }

      ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.14)`;
      ctx.lineWidth = 2.6;
      ctx.shadowBlur = 10;
      ctx.shadowColor = `rgba(${r}, ${g}, ${b}, 0.08)`;
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      for (let i = 1; i <= maxIdx; i++) {
        const mapped = transform(path[i]);
        ctx.lineTo(mapped.x, mapped.y);
      }
      ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.34)`;
      ctx.lineWidth = 0.9;
      ctx.shadowBlur = 0;
      ctx.stroke();
    });

    const [rr, gg, bb] = FRACTAL_PALETTE[3];
    const origin = transform({ x: 0, y: 0 });
    ctx.fillStyle = `rgba(${rr}, ${gg}, ${bb}, 0.7)`;
    ctx.beginPath();
    ctx.arc(origin.x, origin.y, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }

  const scheduleDraw = createRenderScheduler(draw);
  const debouncedRegenerate = debounce(() => {
    generatePaths();
    scheduleDraw();
  }, 95);

  function syncLabels() {
    stepsValue.textContent = String(state.steps);
    stepSizeValue.textContent = state.stepSize.toFixed(1);
  }

  function regenerate() {
    stopAnimation();
    generatePaths();
    state.revealRatio = 1;
    scheduleDraw();
  }

  function stopAnimation() {
    if (!animRaf) return;
    cancelAnimationFrame(animRaf);
    animRaf = 0;
    state.isAnimating = false;
    state.revealRatio = 1;
    if (animateBtn) animateBtn.textContent = "Animate";
    scheduleDraw();
  }

  function startAnimation() {
    if (animRaf) {
      stopAnimation();
      return;
    }

    state.isAnimating = true;
    state.revealRatio = 0.02;
    if (animateBtn) animateBtn.textContent = "Stop";

    function frame() {
      state.revealRatio = Math.min(1, state.revealRatio + 0.012);
      scheduleDraw();

      if (state.revealRatio >= 1) {
        state.isAnimating = false;
        animRaf = 0;
        if (animateBtn) animateBtn.textContent = "Animate";
        return;
      }

      animRaf = requestAnimationFrame(frame);
    }

    animRaf = requestAnimationFrame(frame);
  }

  redrawBtn?.addEventListener("click", regenerate);
  animateBtn?.addEventListener("click", startAnimation);

  stepsInput?.addEventListener("input", () => {
    stopAnimation();
    state.steps = Number(stepsInput.value);
    syncLabels();
    debouncedRegenerate();
  });

  stepsInput?.addEventListener("change", regenerate);

  stepSizeInput?.addEventListener("input", () => {
    stopAnimation();
    state.stepSize = Number(stepSizeInput.value);
    syncLabels();
    debouncedRegenerate();
  });

  stepSizeInput?.addEventListener("change", regenerate);

  bindScreenPanZoom(canvas, state, scheduleDraw, { minZoom: 0.7, maxZoom: 5 });

  canvas.addEventListener("dblclick", () => {
    state.userZoom = 1;
    state.panX = 0;
    state.panY = 0;
    scheduleDraw();
  });

  window.addEventListener("resize", scheduleDraw);
  syncLabels();
  regenerate();
}

document.addEventListener("DOMContentLoaded", () => {
  initMandelbrot();
  initJulia();
  initKoch();
  initDragon();
  initHilbert();
  initBarnsley();
  initBrownian();
});
