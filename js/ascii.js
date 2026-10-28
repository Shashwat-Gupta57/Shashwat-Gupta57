/* Voxel ASCII art — a Canvas2D take on the "spider" preset from 21st.dev/community/ascii.

   Pipeline (per the recipe): draw the photo → sample a grid of cellSize cells → contrast,
   invert and edge emphasis on each cell's luminance → draw every cell as a small shaded voxel
   cube → multiply a tint over it → vignette → animate with a per-cell flicker.

   Usage:  <div data-ascii data-ascii-src="photo.jpg" data-ascii-tint="#1e6fff"></div>
           optional: data-ascii-cell="6" data-ascii-reveal (hover/tap crossfades to the photo)

   Still for anyone who prefers reduced motion; pauses while off screen. */
(function () {
  'use strict';

  var still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var PRESET = {
    cellSize: 6, contrast: 115, brightness: 0, edgeEmphasis: 92, invert: true,
    tint: '#1e6fff', tintOpacity: 48, bg: '#06070b', vignette: 38,
    flickerSpeed: 100, flickerIntensity: 60, fps: 24
  };

  function hexToRgb(h) {
    h = h.replace('#', '');
    if (h.length === 3) h = h.split('').map(function (c) { return c + c; }).join('');
    var n = parseInt(h, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }

  /** Sample the photo into a grid of luminance values (0..1), with contrast, invert and edges. */
  function sample(img, cols, rows, cfg) {
    var c = document.createElement('canvas');
    c.width = cols; c.height = rows;
    var x = c.getContext('2d', { willReadFrequently: true });
    // cover-fit the photo into the grid, like object-fit: cover
    var s = Math.max(cols / img.naturalWidth, rows / img.naturalHeight);
    var w = img.naturalWidth * s, h = img.naturalHeight * s;
    x.drawImage(img, (cols - w) / 2, (rows - h) / 2, w, h); // downscaling averages each cell
    var d = x.getImageData(0, 0, cols, rows).data;
    var lum = new Float32Array(cols * rows);
    var k = cfg.contrast / 100, b = cfg.brightness / 100;
    for (var i = 0; i < cols * rows; i++) {
      var v = (0.2126 * d[i * 4] + 0.7152 * d[i * 4 + 1] + 0.0722 * d[i * 4 + 2]) / 255;
      v = (v - 0.5) * k + 0.5 + b;
      lum[i] = v < 0 ? 0 : v > 1 ? 1 : v;
    }
    // Sobel edge magnitude, mixed in by edgeEmphasis so outlines read clearly
    var out = new Float32Array(cols * rows), e = cfg.edgeEmphasis / 100;
    for (var yy = 0; yy < rows; yy++) {
      for (var xx = 0; xx < cols; xx++) {
        var at = function (cx, cy) {
          cx = cx < 0 ? 0 : cx >= cols ? cols - 1 : cx;
          cy = cy < 0 ? 0 : cy >= rows ? rows - 1 : cy;
          return lum[cy * cols + cx];
        };
        var gx = -at(xx - 1, yy - 1) - 2 * at(xx - 1, yy) - at(xx - 1, yy + 1) + at(xx + 1, yy - 1) + 2 * at(xx + 1, yy) + at(xx + 1, yy + 1);
        var gy = -at(xx - 1, yy - 1) - 2 * at(xx, yy - 1) - at(xx + 1, yy - 1) + at(xx - 1, yy + 1) + 2 * at(xx, yy + 1) + at(xx + 1, yy + 1);
        var edge = Math.min(1, Math.sqrt(gx * gx + gy * gy));
        var v2 = lum[yy * cols + xx];
        if (cfg.invert) v2 = 1 - v2;
        v2 = v2 * (1 - e * 0.55) + edge * e;
        out[yy * cols + xx] = v2 < 0 ? 0 : v2 > 1 ? 1 : v2;
      }
    }
    return out;
  }

  function mount(host) {
    if (host.dataset.asciiReady) return;
    host.dataset.asciiReady = '1';
    var cfg = {};
    for (var key in PRESET) cfg[key] = PRESET[key];
    if (host.dataset.asciiTint) cfg.tint = host.dataset.asciiTint;
    if (host.dataset.asciiCell) cfg.cellSize = +host.dataset.asciiCell;

    var canvas = document.createElement('canvas');
    canvas.className = 'ascii-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    host.appendChild(canvas);
    var ctx = canvas.getContext('2d');
    var tint = hexToRgb(cfg.tint);

    var img = new Image();
    img.decoding = 'async';
    img.src = host.dataset.asciiSrc;

    var cols = 0, rows = 0, grid = null, seeds = null, dpr = 1, W = 0, H = 0, raf = 0, last = 0, visible = true;

    function fit() {
      if (!img.complete || !img.naturalWidth) return;
      var r = host.getBoundingClientRect();
      if (!r.width || !r.height) return;
      dpr = Math.min(2, window.devicePixelRatio || 1);
      W = Math.round(r.width); H = Math.round(r.height);
      canvas.width = W * dpr; canvas.height = H * dpr;
      canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
      cols = Math.max(8, Math.floor(W / cfg.cellSize));
      rows = Math.max(8, Math.floor(H / cfg.cellSize));
      grid = sample(img, cols, rows, cfg);
      seeds = new Float32Array(cols * rows);
      for (var i = 0; i < seeds.length; i++) seeds[i] = Math.random() * 1000;
      paint(performance.now());
    }

    // one voxel: a little cube whose size and shading follow the cell's value
    function voxel(x, y, s, v, flick) {
      var t = Math.max(0, Math.min(1, v * flick));
      if (t < 0.04) return;
      var size = s * (0.35 + 0.65 * t), off = (s - size) / 2;
      var depth = size * 0.28;
      var base = 40 + 215 * t; // brighter cells become brighter, bigger blocks
      // tint by multiply at tintOpacity: mix(white, tint) then multiply
      var m = cfg.tintOpacity / 100;
      var r = base * (1 - m + m * tint[0] / 255), g = base * (1 - m + m * tint[1] / 255), b = base * (1 - m + m * tint[2] / 255);
      var px = x + off, py = y + off;
      ctx.fillStyle = 'rgb(' + (r * 0.55 | 0) + ',' + (g * 0.55 | 0) + ',' + (b * 0.55 | 0) + ')'; // right side
      ctx.fillRect(px + depth, py + depth, size - depth, size - depth);
      ctx.fillStyle = 'rgb(' + (r | 0) + ',' + (g | 0) + ',' + (b | 0) + ')'; // face
      ctx.fillRect(px, py, size - depth, size - depth);
      ctx.fillStyle = 'rgba(255,255,255,' + (0.18 * t).toFixed(3) + ')'; // top-left highlight
      ctx.fillRect(px, py, size - depth, Math.max(1, depth * 0.5));
    }

    function paint(now) {
      if (!grid) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = cfg.bg;
      ctx.fillRect(0, 0, W, H);
      var s = cfg.cellSize, ox = (W - cols * s) / 2, oy = (H - rows * s) / 2;
      var tt = now / 1000 * (cfg.flickerSpeed / 100) * 6;
      var amp = still ? 0 : cfg.flickerIntensity / 100;
      for (var yy = 0; yy < rows; yy++) {
        for (var xx = 0; xx < cols; xx++) {
          var i = yy * cols + xx;
          // flicker: each cell has its own phase; occasional hard drop-outs give the "spider" crackle
          var ph = seeds[i] + tt;
          var f = 1 - amp * 0.35 * (0.5 + 0.5 * Math.sin(ph * 1.7)) - (amp && Math.sin(ph * 0.37 + seeds[i]) > 0.985 ? amp * 0.8 : 0);
          voxel(ox + xx * s, oy + yy * s, s, grid[i], f);
        }
      }
      // vignette
      var v = cfg.vignette / 100;
      var gr = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.25, W / 2, H / 2, Math.max(W, H) * 0.72);
      gr.addColorStop(0, 'rgba(0,0,0,0)');
      gr.addColorStop(1, 'rgba(0,0,0,' + v + ')');
      ctx.fillStyle = gr;
      ctx.fillRect(0, 0, W, H);
    }

    function tick(now) {
      raf = 0;
      if (!visible || still) return;
      if (now - last >= 1000 / cfg.fps) { last = now; paint(now); }
      raf = requestAnimationFrame(tick);
    }
    function play() { if (!raf && visible && !still) raf = requestAnimationFrame(tick); }

    img.onload = function () { fit(); host.classList.add('ascii-on'); play(); };
    if ('ResizeObserver' in window) new ResizeObserver(function () { fit(); }).observe(host);
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) { visible = es[0].isIntersecting; if (visible) play(); }).observe(host);
    }
    document.addEventListener('visibilitychange', function () { visible = document.visibilityState === 'visible'; if (visible) play(); });

    // touch devices have no hover: a tap toggles the reveal
    if (host.hasAttribute('data-ascii-reveal')) {
      host.addEventListener('click', function () { host.classList.toggle('ascii-revealed'); });
    }
  }

  function init() { document.querySelectorAll('[data-ascii]').forEach(mount); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
  window.SiteAscii = { mount: mount };
})();
