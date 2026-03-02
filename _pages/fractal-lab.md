---
layout: page
title: Fractal Lab
permalink: /fractal-lab/
description: Interactive Mandelbrot & Julia explorer in Galaxy Math style.
nav: true
nav_order: 6
fractal_lab: true
---

{% if site.enable_fractal_lab %}

A tiny interactive playground for complex dynamics.

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

    <button id="fractal-reset" type="button">Reset view</button>
  </div>

  <canvas id="fractal-canvas" role="img" aria-label="Interactive fractal simulation"></canvas>

  <p class="fractal-help">
    Tip: in Julia mode, click the canvas to change parameter $c$.
  </p>
</div>

{% else %}

Fractal Lab is currently disabled in site configuration.

{% endif %}
