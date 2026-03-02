---
layout: page
title: Fractal Lab
permalink: /fractal-lab/
description: Interactive Mandelbrot & Julia explorer in Galaxy Math style.
nav: true
nav_order: 6
fractal_lab: true
magenta_starfield: true
---

{% if site.enable_fractal_lab %}

*"We need to understand, in much closer fidelity to reality, how different kinds of prices move, how risk is measured and how money is made and lost. Without that knowledge, we are doomerd to crashes, again and again."* 

Use your mouse wheel to zoom, drag to pan, and switch between Mandelbrot/Julia sets.

<div class="fractal-lab">
  <div class="fractal-controls">
    <label for="fractal-type">Set</label>
    <select id="fractal-type">
      <option value="mandelbrot" selected>Mandelbrot</option>
      <option value="julia">Julia</option>
    </select>

    <label for="fractal-iterations">Iterations</label>
    <input id="fractal-iterations" type="range" min="60" max="500" value="180" step="10">
    <span id="fractal-iterations-value">180</span>

    <button id="fractal-turbo" type="button" aria-pressed="false">Realtime: OFF</button>
    <button id="fractal-reset" type="button">Reset view</button>
    <span id="fractal-render-status" class="fractal-status">HQ</span>
  </div>

  <canvas id="fractal-canvas" role="img" aria-label="Interactive fractal simulation"></canvas>

  <p class="fractal-help">
    Tip: in Julia mode, click the canvas to change parameter $c$.
  </p>
</div>

---

### Mathematical definitions

For both sets, the core iteration is:

$$
z_{n+1}=z_n^2+c,
$$

where $z, c \in \mathbb{C}$.

- **Mandelbrot set** ($M$):

  $$
  M=\left\{c\in\mathbb{C}:\{z_n\}_{n\ge 0}\text{ stays bounded with }z_0=0\right\}.
  $$

  Reference: [Mandelbrot set (Wikipedia)](https://en.wikipedia.org/wiki/Mandelbrot_set).

- **Julia set** ($J_c$) for a fixed parameter $c$:

  $$
  J_c=\partial K_c,\qquad K_c=\left\{z\in\mathbb{C}:\{f_c^{\,n}(z)\}_{n\ge 0}\text{ is bounded}\right\},\quad f_c(z)=z^2+c.
  $$

  Reference: [Julia set (Wikipedia)](https://en.wikipedia.org/wiki/Julia_set).

{% else %}

Fractal Lab is currently disabled in site configuration.

{% endif %}
