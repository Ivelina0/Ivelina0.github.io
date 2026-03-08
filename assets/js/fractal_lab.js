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

function fitCanvas(canvas, targetHeight = 300) {
  const dpr = Math.max(1, window.devicePixelRatio || 1);
  const width = Math.max(1, Math.floor(canvas.clientWidth || 640));
  const height = Math.max(1, Math.floor(targetHeight));
  canvas.width = Math.floor(width * dpr);
  canvas.height = Math.floor(height * dpr);
  const ctx = canvas.getContext("2d", { alpha: false });
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { ctx, width, height };
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

  function pixelToComplex(px, py, width, height) {
    const aspect = width / height;
    return {
      x: state.centerX + ((px / width) - 0.5) * state.scale * aspect,
      y: state.centerY + ((py / height) - 0.5) * state.scale,
    };
  }

  function render() {
    const { ctx, width, height } = fitCanvas(canvas, 320);
    const image = ctx.createImageData(width, height);
    const data = image.data;
    const aspect = width / height;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const cx = state.centerX + ((x / width) - 0.5) * state.scale * aspect;
        const cy = state.centerY + ((y / height) - 0.5) * state.scale;

        let zx = 0;
        let zy = 0;
        let iter = 0;

        while (iter < state.maxIter) {
          const zx2 = zx * zx - zy * zy + cx;
          const zy2 = 2 * zx * zy + cy;
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

  function resetView() {
    state.centerX = -0.55;
    state.centerY = 0;
    state.scale = 3.2;
    render();
  }

  iterValue.textContent = String(state.maxIter);

  iterInput?.addEventListener("input", () => {
    state.maxIter = Number(iterInput.value);
    iterValue.textContent = String(state.maxIter);
    render();
  });

  resetBtn?.addEventListener("click", resetView);

  canvas.addEventListener("wheel", (e) => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    const before = pixelToComplex(px, py, rect.width, rect.height);

    const zoom = e.deltaY < 0 ? 0.86 : 1.16;
    state.scale *= zoom;
    state.scale = Math.max(0.000001, Math.min(6, state.scale));

    const after = pixelToComplex(px, py, rect.width, rect.height);
    state.centerX += before.x - after.x;
    state.centerY += before.y - after.y;
    render();
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
    render();
  });

  window.addEventListener("mouseup", () => {
    state.dragging = false;
  });

  window.addEventListener("resize", render);
  render();
}

function initJulia() {
  const canvas = document.getElementById("julia-canvas");
  if (!canvas) return;

  const reInput = document.getElementById("julia-re");
  const imInput = document.getElementById("julia-im");
  const reValue = document.getElementById("julia-re-value");
  const imValue = document.getElementById("julia-im-value");

  const state = {
    cRe: Number(reInput?.value || -0.79),
    cIm: Number(imInput?.value || 0.15),
    maxIter: 220,
  };

  function render() {
    const { ctx, width, height } = fitCanvas(canvas, 320);
    const image = ctx.createImageData(width, height);
    const data = image.data;
    const aspect = width / height;
    const scale = 3.0;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let zx = ((x / width) - 0.5) * scale * aspect;
        let zy = ((y / height) - 0.5) * scale;
        let iter = 0;

        while (iter < state.maxIter) {
          const zx2 = zx * zx - zy * zy + state.cRe;
          const zy2 = 2 * zx * zy + state.cIm;
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

  function syncLabels() {
    reValue.textContent = state.cRe.toFixed(2);
    imValue.textContent = state.cIm.toFixed(2);
  }

  reInput?.addEventListener("input", () => {
    state.cRe = Number(reInput.value);
    syncLabels();
    render();
  });

  imInput?.addEventListener("input", () => {
    state.cIm = Number(imInput.value);
    syncLabels();
    render();
  });

  window.addEventListener("resize", render);
  syncLabels();
  render();
}

function initKoch() {
  const canvas = document.getElementById("koch-canvas");
  if (!canvas) return;

  const depthInput = document.getElementById("koch-depth");
  const depthValue = document.getElementById("koch-depth-value");

  let depth = Number(depthInput?.value || 4);

  function subdivide(a, b, level, out) {
    if (level === 0) {
      out.push([a, b]);
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

    subdivide(a, p1, level - 1, out);
    subdivide(p1, peak, level - 1, out);
    subdivide(peak, p2, level - 1, out);
    subdivide(p2, b, level - 1, out);
  }

  function render() {
    const { ctx, width, height } = fitCanvas(canvas, 300);
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#050308";
    ctx.fillRect(0, 0, width, height);

    const margin = 24;
    const pA = { x: width / 2, y: margin };
    const pB = { x: width - margin, y: height - margin };
    const pC = { x: margin, y: height - margin };
    const segments = [];

    subdivide(pA, pB, depth, segments);
    subdivide(pB, pC, depth, segments);
    subdivide(pC, pA, depth, segments);

    ctx.strokeStyle = "rgba(236, 126, 220, 0.95)";
    ctx.lineWidth = 1.2;
    ctx.shadowBlur = 10;
    ctx.shadowColor = "rgba(255, 66, 208, 0.25)";

    ctx.beginPath();
    for (const [s, e] of segments) {
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(e.x, e.y);
    }
    ctx.stroke();
  }

  depthValue.textContent = String(depth);

  depthInput?.addEventListener("input", () => {
    depth = Number(depthInput.value);
    depthValue.textContent = String(depth);
    render();
  });

  window.addEventListener("resize", render);
  render();
}

function initBarnsley() {
  const canvas = document.getElementById("barnsley-canvas");
  if (!canvas) return;

  const regenerateBtn = document.getElementById("barnsley-regenerate");

  function render() {
    const { ctx, width, height } = fitCanvas(canvas, 320);
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#050308";
    ctx.fillRect(0, 0, width, height);

    let x = 0;
    let y = 0;
    const n = 28000;

    for (let i = 0; i < n; i++) {
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

      const px = width / 2 + x * (width / 11);
      const py = height - y * (height / 12) - 8;

      ctx.fillStyle = `rgba(0, 170, 110, ${0.2 + 0.6 * Math.random()})`;
      ctx.fillRect(px, py, 1.2, 1.2);
    }
  }

  regenerateBtn?.addEventListener("click", render);
  window.addEventListener("resize", render);
  render();
}

function initBrownian() {
  const canvas = document.getElementById("brownian-canvas");
  if (!canvas) return;

  const redrawBtn = document.getElementById("brownian-redraw");

  function render() {
    const { ctx, width, height } = fitCanvas(canvas, 320);
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#050308";
    ctx.fillRect(0, 0, width, height);

    for (let w = 0; w < 36; w++) {
      let x = width * (0.1 + 0.8 * Math.random());
      let y = height * (0.1 + 0.8 * Math.random());
      const color = FRACTAL_PALETTE[Math.floor(Math.random() * FRACTAL_PALETTE.length)];
      const [r, g, b] = color;

      ctx.beginPath();
      ctx.moveTo(x, y);

      for (let k = 0; k < 230; k++) {
        x += (Math.random() - 0.5) * 9;
        y += (Math.random() - 0.5) * 9;

        if (x < 0) x = width;
        if (x > width) x = 0;
        if (y < 0) y = height;
        if (y > height) y = 0;

        ctx.lineTo(x, y);
      }

      ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.28)`;
      ctx.lineWidth = 1;
      ctx.shadowBlur = 5;
      ctx.shadowColor = `rgba(${r}, ${g}, ${b}, 0.14)`;
      ctx.stroke();
    }
  }

  redrawBtn?.addEventListener("click", render);
  window.addEventListener("resize", render);
  render();
}

document.addEventListener("DOMContentLoaded", () => {
  initMandelbrot();
  initJulia();
  initKoch();
  initBarnsley();
  initBrownian();
});
