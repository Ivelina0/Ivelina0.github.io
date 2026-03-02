(function () {
  const canvas = document.getElementById('fractal-canvas');
  if (!canvas) return;

  const typeSelect = document.getElementById('fractal-type');
  const iterInput = document.getElementById('fractal-iterations');
  const iterValue = document.getElementById('fractal-iterations-value');
  const resetBtn = document.getElementById('fractal-reset');

  const dpr = Math.max(1, window.devicePixelRatio || 1);
  const ctx = canvas.getContext('2d', { alpha: false });

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
  };

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
    render();
  }

  function resetView() {
    state.centerX = state.type === 'mandelbrot' ? -0.55 : 0;
    state.centerY = 0;
    state.scale = state.type === 'mandelbrot' ? 3.2 : 3.0;
    render();
  }

  function pixelToComplex(px, py) {
    const aspect = width / height;
    const x = state.centerX + ((px / width) - 0.5) * state.scale * aspect;
    const y = state.centerY + ((py / height) - 0.5) * state.scale;
    return { x, y };
  }

  function getColor(iter, x, y) {
    if (iter >= state.maxIter) return [5, 3, 10];

    const smooth = iter + 1 - Math.log(Math.log(Math.sqrt(x * x + y * y))) / Math.log(2);
    const t = Math.max(0, Math.min(1, smooth / state.maxIter));

    const r = Math.floor(20 + 235 * Math.pow(t, 0.75));
    const g = Math.floor(8 + 90 * Math.pow(t, 1.6));
    const b = Math.floor(35 + 220 * Math.pow(t, 0.9));

    return [r, g, b];
  }

  let renderToken = 0;

  function render() {
    renderToken += 1;
    const token = renderToken;

    const image = ctx.createImageData(width, height);
    const data = image.data;

    let y = 0;
    const aspect = width / height;

    function drawChunk() {
      if (token !== renderToken) return;

      const rowsPerFrame = 14;
      const yEnd = Math.min(height, y + rowsPerFrame);

      for (; y < yEnd; y++) {
        for (let x = 0; x < width; x++) {
          const cx = state.centerX + ((x / width) - 0.5) * state.scale * aspect;
          const cy = state.centerY + ((y / height) - 0.5) * state.scale;

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
          const idx = (y * width + x) * 4;
          data[idx] = r;
          data[idx + 1] = g;
          data[idx + 2] = b;
          data[idx + 3] = 255;
        }
      }

      ctx.putImageData(image, 0, 0);

      if (y < height) {
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

    render();
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

    render();
  });

  window.addEventListener('mouseup', () => {
    isDragging = false;
  });

  canvas.addEventListener('click', (e) => {
    if (state.type !== 'julia') return;
    const rect = canvas.getBoundingClientRect();
    const p = pixelToComplex(e.clientX - rect.left, e.clientY - rect.top);
    state.juliaCx = p.x;
    state.juliaCy = p.y;
    render();
  });

  typeSelect.addEventListener('change', () => {
    state.type = typeSelect.value;
    resetView();
  });

  iterInput.addEventListener('input', () => {
    state.maxIter = Number(iterInput.value);
    iterValue.textContent = String(state.maxIter);
    render();
  });

  resetBtn.addEventListener('click', resetView);
  window.addEventListener('resize', resize);

  iterValue.textContent = String(state.maxIter);
  resize();
})();
