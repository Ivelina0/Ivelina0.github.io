(function () {
  const canvas = document.getElementById('fractal-canvas');
  if (!canvas) return;

  const typeSelect = document.getElementById('fractal-type');
  const iterInput = document.getElementById('fractal-iterations');
  const iterValue = document.getElementById('fractal-iterations-value');
  const resetBtn = document.getElementById('fractal-reset');
  const turboBtn = document.getElementById('fractal-turbo');
  const statusEl = document.getElementById('fractal-render-status');

  const dpr = Math.max(1, window.devicePixelRatio || 1);
  const ctx = canvas.getContext('2d', { alpha: false });
  const bufferCanvas = document.createElement('canvas');
  const bufferCtx = bufferCanvas.getContext('2d', { alpha: false });

  let width = 0;
  let height = 0;

  const state = {
    type: 'mandelbrot',
    maxIter: 180,
    centerX: -0.55,
    centerY: 0,
    scale: 3.2,
    juliaCx: -0.79,
    juliaCy: 0.15,
    fastMode: false,
  };

  let hqTimer = null;

  let isDragging = false;
  let dragStartX = 0;
  let dragStartY = 0;
  let dragStartCenterX = 0;
  let dragStartCenterY = 0;

  function resize() {
    const rect = canvas.getBoundingClientRect();
    width = Math.max(1, Math.floor(rect.width));
    height = Math.max(1, Math.floor(rect.height));
    canvas.width = Math.max(1, Math.floor(width * dpr));
    canvas.height = Math.max(1, Math.floor(height * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    render(1, false);
  }

  function resetView() {
    state.centerX = state.type === 'mandelbrot' ? -0.55 : 0;
    state.centerY = 0;
    state.scale = state.type === 'mandelbrot' ? 3.2 : 3.0;
    render(1, false);
  }

  function setStatus(text) {
    if (!statusEl) return;
    statusEl.textContent = text;
  }

  function scheduleHQ(delay = 120) {
    if (hqTimer) clearTimeout(hqTimer);
    hqTimer = setTimeout(() => {
      render(1, false);
    }, delay);
  }

  function renderInteractive() {
    const previewScale = state.fastMode ? 0.34 : 0.46;
    render(previewScale, true);
    scheduleHQ(state.fastMode ? 80 : 130);
  }

  function pixelToComplex(px, py) {
    const aspect = width / height;
    const x = state.centerX + ((px / width) - 0.5) * state.scale * aspect;
    const y = state.centerY + ((py / height) - 0.5) * state.scale;
    return { x, y };
  }

  const fractalPalette = [
    [0, 128, 128],   // #008080
    [128, 128, 0],   // #808000
    [128, 0, 128],   // #800080
    [230, 0, 230],   // #e600e6
    [128, 0, 64],    // #800040
    [64, 0, 128],    // #400080
    [184, 188, 224], // soft highlight
  ];

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function getColor(iter, x, y) {
    if (iter >= state.maxIter) return [5, 3, 10];

    const smooth = iter + 1 - Math.log(Math.log(Math.sqrt(x * x + y * y))) / Math.log(2);
    const t = Math.max(0, Math.min(1, smooth / state.maxIter));
    const mapped = Math.pow(t, 0.85) * (fractalPalette.length - 1);

    const i0 = Math.floor(mapped);
    const i1 = Math.min(fractalPalette.length - 1, i0 + 1);
    const f = mapped - i0;

    const c0 = fractalPalette[i0];
    const c1 = fractalPalette[i1];

    return [
      Math.floor(lerp(c0[0], c1[0], f)),
      Math.floor(lerp(c0[1], c1[1], f)),
      Math.floor(lerp(c0[2], c1[2], f)),
    ];
  }

  let renderToken = 0;

  function render(sampleScale = 1, isPreview = false) {
    renderToken += 1;
    const token = renderToken;

    const rw = Math.max(1, Math.floor(width * sampleScale));
    const rh = Math.max(1, Math.floor(height * sampleScale));
    bufferCanvas.width = rw;
    bufferCanvas.height = rh;

    const image = bufferCtx.createImageData(rw, rh);
    const data = image.data;

    let y = 0;
    const aspect = width / height;

    setStatus(isPreview ? 'Preview' : 'HQ');

    function drawChunk() {
      if (token !== renderToken) return;

      const rowsPerFrame = isPreview ? (state.fastMode ? 56 : 42) : 18;
      const yEnd = Math.min(rh, y + rowsPerFrame);

      for (; y < yEnd; y++) {
        for (let x = 0; x < rw; x++) {
          const cx = state.centerX + ((x / rw) - 0.5) * state.scale * aspect;
          const cy = state.centerY + ((y / rh) - 0.5) * state.scale;

          let zx;
          let zy;
          let cRe;
          let cIm;

          if (state.type === 'mandelbrot') {
            zx = 0;
            zy = 0;
            cRe = cx;
            cIm = cy;
          } else {
            zx = cx;
            zy = cy;
            cRe = state.juliaCx;
            cIm = state.juliaCy;
          }

          let iter = 0;
          while (iter < state.maxIter) {
            const zx2 = zx * zx - zy * zy + cRe;
            const zy2 = 2 * zx * zy + cIm;
            zx = zx2;
            zy = zy2;

            if (zx * zx + zy * zy > 4) break;
            iter++;
          }

          const [r, g, b] = getColor(iter, zx, zy);
          const idx = (y * rw + x) * 4;
          data[idx] = r;
          data[idx + 1] = g;
          data[idx + 2] = b;
          data[idx + 3] = 255;
        }
      }

      bufferCtx.putImageData(image, 0, 0);
      ctx.imageSmoothingEnabled = !isPreview;
      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(bufferCanvas, 0, 0, rw, rh, 0, 0, width, height);

      if (y < rh) {
        requestAnimationFrame(drawChunk);
      }
    }

    requestAnimationFrame(drawChunk);
  }

  canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    const before = pixelToComplex(px, py);
    const zoom = e.deltaY < 0 ? 0.86 : 1.16;
    state.scale *= zoom;
    state.scale = Math.max(0.000001, Math.min(6, state.scale));

    const after = pixelToComplex(px, py);
    state.centerX += before.x - after.x;
    state.centerY += before.y - after.y;

    renderInteractive();
  }, { passive: false });

  canvas.addEventListener('mousedown', (e) => {
    isDragging = true;
    dragStartX = e.clientX;
    dragStartY = e.clientY;
    dragStartCenterX = state.centerX;
    dragStartCenterY = state.centerY;
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;

    const dx = e.clientX - dragStartX;
    const dy = e.clientY - dragStartY;
    const aspect = width / height;

    state.centerX = dragStartCenterX - (dx / width) * state.scale * aspect;
    state.centerY = dragStartCenterY - (dy / height) * state.scale;

    renderInteractive();
  });

  window.addEventListener('mouseup', () => {
    isDragging = false;
    scheduleHQ(60);
  });

  canvas.addEventListener('click', (e) => {
    if (state.type !== 'julia') return;
    const rect = canvas.getBoundingClientRect();
    const p = pixelToComplex(e.clientX - rect.left, e.clientY - rect.top);
    state.juliaCx = p.x;
    state.juliaCy = p.y;
    renderInteractive();
  });

  typeSelect.addEventListener('change', () => {
    state.type = typeSelect.value;
    resetView();
  });

  iterInput.addEventListener('input', () => {
    state.maxIter = Number(iterInput.value);
    iterValue.textContent = String(state.maxIter);
    renderInteractive();
  });

  if (turboBtn) {
    turboBtn.addEventListener('click', () => {
      state.fastMode = !state.fastMode;
      turboBtn.textContent = `Realtime: ${state.fastMode ? 'ON' : 'OFF'}`;
      turboBtn.setAttribute('aria-pressed', state.fastMode ? 'true' : 'false');
      renderInteractive();
    });
  }

  resetBtn.addEventListener('click', resetView);
  window.addEventListener('resize', resize);

  iterValue.textContent = String(state.maxIter);
  resize();
})();
