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

function getFractalColor(iter, maxIter, x, y) {
  if (iter >= maxIter) return [5, 3, 10];

  const abs = Math.max(1.000001, Math.sqrt(x * x + y * y));
  const smooth = iter + 1 - Math.log(Math.log(abs)) / Math.log(2);
  const t = Math.max(0, Math.min(1, smooth / maxIter));
  const mapped = Math.pow(t, 0.85) * (FRACTAL_PALETTE.length - 1);

  const i0 = Math.floor(mapped);
  const i1 = Math.min(FRACTAL_PALETTE.length - 1, i0 + 1);
  const f = mapped - i0;
  const c0 = FRACTAL_PALETTE[i0];
  const c1 = FRACTAL_PALETTE[i1];

  return [
    Math.floor(lerp(c0[0], c1[0], f)),
    Math.floor(lerp(c0[1], c1[1], f)),
    Math.floor(lerp(c0[2], c1[2], f)),
  ];
}

function resizeCanvasForDPR(canvas, targetHeight = 320) {
  const dpr = Math.max(1, window.devicePixelRatio || 1);
  const width = Math.max(1, Math.floor(canvas.clientWidth || 640));
  const cssHeight = canvas.clientHeight > 0 ? canvas.clientHeight : targetHeight;
  const height = Math.max(1, Math.floor(cssHeight));

  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);

  const ctx = canvas.getContext("2d", { alpha: false });
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  return { ctx, width, height };
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

    const zoom = e.deltaY < 0 ? 0.86 : 1.16;
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
    state.dragging = false;
  });
}

function renderEscapeFractal(canvas, state, mode = "mandelbrot") {
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

      const [r, g, b] = getFractalColor(iter, state.maxIter, zx, zy);
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
    renderEscapeFractal(canvas, state, "mandelbrot");
  }

  const scheduleRender = createRenderScheduler(render);

  function resetView() {
    state.centerX = -0.55;
    state.centerY = 0;
    state.scale = 3.2;
    scheduleRender();
  }

  iterValue.textContent = String(state.maxIter);

  iterInput?.addEventListener("input", () => {
    state.maxIter = Number(iterInput.value);
    iterValue.textContent = String(state.maxIter);
    scheduleRender();
  });

  resetBtn?.addEventListener("click", resetView);

  bindPanZoom(canvas, state, scheduleRender);

  window.addEventListener("resize", scheduleRender);
  scheduleRender();
}

function initJulia() {
  const canvas = document.getElementById("julia-canvas");
  if (!canvas) return;

  const reInput = document.getElementById("julia-re");
  const imInput = document.getElementById("julia-im");
  const resetBtn = document.getElementById("julia-reset");
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
    renderEscapeFractal(canvas, state, "julia");
  }

  const scheduleRender = createRenderScheduler(render);

  function syncLabels() {
    reValue.textContent = state.cRe.toFixed(2);
    imValue.textContent = state.cIm.toFixed(2);
  }

  function resetView() {
    state.centerX = 0;
    state.centerY = 0;
    state.scale = 3;
    scheduleRender();
  }

  reInput?.addEventListener("input", () => {
    state.cRe = Number(reInput.value);
    syncLabels();
    scheduleRender();
  });

  imInput?.addEventListener("input", () => {
    state.cIm = Number(imInput.value);
    syncLabels();
    scheduleRender();
  });

  resetBtn?.addEventListener("click", resetView);

  bindPanZoom(canvas, state, scheduleRender);

  window.addEventListener("resize", scheduleRender);
  syncLabels();
  scheduleRender();
}

function initKoch() {
  const canvas = document.getElementById("koch-canvas");
  if (!canvas) return;

  const depthInput = document.getElementById("koch-depth");
  const depthValue = document.getElementById("koch-depth-value");

  let depth = Number(depthInput?.value || 4);

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

  depthValue.textContent = String(depth);

  depthInput?.addEventListener("input", () => {
    depth = Number(depthInput.value);
    depthValue.textContent = String(depth);
    scheduleRender();
  });

  window.addEventListener("resize", scheduleRender);
  scheduleRender();
}

function initBarnsley() {
  const canvas = document.getElementById("barnsley-canvas");
  if (!canvas) return;

  const regenerateBtn = document.getElementById("barnsley-regenerate");
  const pointsInput = document.getElementById("barnsley-points");
  const pointsValue = document.getElementById("barnsley-points-value");
  const zoomInput = document.getElementById("barnsley-zoom");
  const zoomValue = document.getElementById("barnsley-zoom-value");

  const state = {
    pointCount: Number(pointsInput?.value || 50000),
    zoom: Number(zoomInput?.value || 1),
    points: [],
  };

  function generatePoints() {
    let x = (Math.random() - 0.5) * 0.4;
    let y = (Math.random() - 0.5) * 0.4;
    const out = [];

    const burnIn = 80;
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
    ctx.fillStyle = "#050308";
    ctx.fillRect(0, 0, width, height);

    const fit = fitPointsToCanvas(state.points, width, height, 18);
    const centerX = width * 0.5;
    const centerY = height * 0.55;

    for (const p of state.points) {
      const mapped = fit.map(p);
      const px = centerX + (mapped.x - centerX) * state.zoom;
      const py = centerY + (mapped.y - centerY) * state.zoom;
      ctx.fillStyle = "rgba(70, 218, 140, 0.6)";
      ctx.fillRect(px, py, 1.05, 1.05);
    }
  }

  const scheduleDraw = createRenderScheduler(draw);

  function syncLabels() {
    pointsValue.textContent = String(state.pointCount);
    zoomValue.textContent = state.zoom.toFixed(2);
  }

  regenerateBtn?.addEventListener("click", () => {
    generatePoints();
    scheduleDraw();
  });

  pointsInput?.addEventListener("input", () => {
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

  window.addEventListener("resize", scheduleDraw);
  syncLabels();
  generatePoints();
  scheduleDraw();
}

function initBrownian() {
  const canvas = document.getElementById("brownian-canvas");
  if (!canvas) return;

  const redrawBtn = document.getElementById("brownian-redraw");
  const stepsInput = document.getElementById("brownian-steps");
  const stepsValue = document.getElementById("brownian-steps-value");
  const stepSizeInput = document.getElementById("brownian-step-size");
  const stepSizeValue = document.getElementById("brownian-step-size-value");

  const state = {
    steps: Number(stepsInput?.value || 1200),
    stepSize: Number(stepSizeInput?.value || 1.7),
    paths: [],
  };

  function generatePaths() {
    const nPaths = 8;
    const paths = [];
    for (let p = 0; p < nPaths; p++) {
      const points = [{ x: 0, y: 0 }];
      let x = 0;
      let y = 0;

      for (let i = 0; i < state.steps; i++) {
        x += (Math.random() - 0.5) * 2 * state.stepSize;
        y += (Math.random() - 0.5) * 2 * state.stepSize;
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
    ctx.fillStyle = "#050308";
    ctx.fillRect(0, 0, width, height);

    const all = [];
    for (const path of state.paths) {
      for (const p of path) all.push(p);
    }
    const fit = fitPointsToCanvas(all, width, height, 24);

    state.paths.forEach((path, index) => {
      const [r, g, b] = FRACTAL_PALETTE[index % FRACTAL_PALETTE.length];
      ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.34)`;
      ctx.lineWidth = 1;
      ctx.shadowBlur = 3;
      ctx.shadowColor = `rgba(${r}, ${g}, ${b}, 0.18)`;

      ctx.beginPath();
      const start = fit.map(path[0]);
      ctx.moveTo(start.x, start.y);

      for (let i = 1; i < path.length; i++) {
        const mapped = fit.map(path[i]);
        ctx.lineTo(mapped.x, mapped.y);
      }
      ctx.stroke();
    });

    const [rr, gg, bb] = FRACTAL_PALETTE[3];
    const origin = fit.map({ x: 0, y: 0 });
    ctx.fillStyle = `rgba(${rr}, ${gg}, ${bb}, 0.7)`;
    ctx.beginPath();
    ctx.arc(origin.x, origin.y, 2.3, 0, Math.PI * 2);
    ctx.fill();
  }

  const scheduleDraw = createRenderScheduler(draw);

  function syncLabels() {
    stepsValue.textContent = String(state.steps);
    stepSizeValue.textContent = state.stepSize.toFixed(1);
  }

  function regenerate() {
    generatePaths();
    scheduleDraw();
  }

  redrawBtn?.addEventListener("click", regenerate);

  stepsInput?.addEventListener("input", () => {
    state.steps = Number(stepsInput.value);
    syncLabels();
    regenerate();
  });

  stepSizeInput?.addEventListener("input", () => {
    state.stepSize = Number(stepSizeInput.value);
    syncLabels();
    regenerate();
  });

  window.addEventListener("resize", scheduleDraw);
  syncLabels();
  regenerate();
}

document.addEventListener("DOMContentLoaded", () => {
  initMandelbrot();
  initJulia();
  initKoch();
  initBarnsley();
  initBrownian();
});
