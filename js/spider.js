/* The ASCII spider — the "spider" preset from 21st.dev/community/ascii, rebuilt on Canvas2D.

   A spider is painted procedurally into a small offscreen canvas every frame (body + eight
   jointed legs that sway), blurred for a soft glow, then sampled into a grid and drawn as tiny
   voxel blocks: tinted blue on deep navy, with sparse sparkle, faint crosshair lines, a
   vignette and a per-cell flicker.

   Usage: <div data-spider></div>   (fills its box; still for reduced motion; pauses off screen) */
(function () {
  'use strict';

  var still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var CFG = { cell: 5, tint: [30, 111, 255], bg: '#030714', fps: 30, vignette: 0.55 };

  // ---- the spider, in a 200 x 400 unit space, drawn white on black ----
  // each leg (right side; the left mirrors it): knee and claw positions relative to the body
  var LEGS = [
    { kx: 50, ky: -78, tx: 22, ty: -168, ph: 0.0 },  // front pair: arc up and curl in
    { kx: 78, ky: -34, tx: 82, ty: -112, ph: 1.3 },
    { kx: 80, ky: 28, tx: 86, ty: 118, ph: 2.1 },
    { kx: 56, ky: 84, tx: 20, ty: 196, ph: 3.4 }     // back pair: arc down and curl in
  ];

  function drawSpider(x, w, h, t) {
    x.setTransform(1, 0, 0, 1, 0, 0);
    x.fillStyle = '#000';
    x.fillRect(0, 0, w, h);
    var s = Math.min(w / 200, h / 400);
    x.setTransform(s, 0, 0, s, (w - 200 * s) / 2, (h - 400 * s) / 2);
    x.lineCap = 'round';
    x.lineJoin = 'round';
    var cx = 100, cy = 178;

    // Each leg is one long arc from the hip, bowing outward through its knee and curling back
    // in at the tip, so the eight legs trace an oval around the body like the reference.
    // Drawn as many short segments so it can taper from hip to claw.
    [-1, 1].forEach(function (side) {
      LEGS.forEach(function (L, i) {
        var sway = still ? 0 : Math.sin(t * 1.3 + L.ph + (side > 0 ? 0.9 : 0)) * 5 + Math.sin(t * 3.3 + i * 1.7) * 1.4;
        var hx = cx + side * 5, hy = cy + (i - 1.5) * 4;
        var kx = cx + side * (L.kx + sway * 0.4), ky = cy + L.ky + sway * 0.6;
        var tx = cx + side * (L.tx + sway * 0.25), ty = cy + L.ty + sway;
        var steps = 26, px = hx, py = hy;
        for (var k = 1; k <= steps; k++) {
          var u = k / steps, iu = 1 - u;
          // quadratic Bezier through a control point pushed past the knee
          var qx = iu * iu * hx + 2 * iu * u * (kx * 1.18 - cx * 0.18) + u * u * tx;
          var qy = iu * iu * hy + 2 * iu * u * (ky * 1.18 - cy * 0.18) + u * u * ty;
          x.strokeStyle = 'rgba(255,255,255,' + (0.95 - u * 0.55).toFixed(2) + ')';
          x.lineWidth = 3.6 * (1 - u * 0.78);
          x.beginPath(); x.moveTo(px, py); x.lineTo(qx, qy); x.stroke();
          px = qx; py = qy;
        }
      });
    });

    // a small, translucent body: cephalothorax, waist, and an abdomen with a glowing core
    var breathe = still ? 1 : 1 + Math.sin(t * 2) * 0.04;
    x.fillStyle = 'rgba(255,255,255,0.92)';
    x.beginPath(); x.ellipse(cx, cy - 2, 10, 13, 0, 0, Math.PI * 2); x.fill();
    x.fillStyle = 'rgba(255,255,255,0.7)';
    x.beginPath(); x.ellipse(cx, cy + 14, 4, 5, 0, 0, Math.PI * 2); x.fill();
    var g = x.createRadialGradient(cx, cy + 36, 2, cx, cy + 38, 28 * breathe);
    g.addColorStop(0, 'rgba(255,255,255,0.9)');
    g.addColorStop(0.55, 'rgba(255,255,255,0.42)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    x.fillStyle = g;
    x.beginPath(); x.ellipse(cx, cy + 38, 17 * breathe, 27 * breathe, 0, 0, Math.PI * 2); x.fill();
    // pedipalps
    x.strokeStyle = 'rgba(255,255,255,0.8)'; x.lineWidth = 1.6;
    x.beginPath(); x.moveTo(cx - 4, cy - 13); x.quadraticCurveTo(cx - 9, cy - 24, cx - 6, cy - 30);
    x.moveTo(cx + 4, cy - 13); x.quadraticCurveTo(cx + 9, cy - 24, cx + 6, cy - 30); x.stroke();
  }

  function mount(host) {
    if (host.dataset.spiderReady) return;
    host.dataset.spiderReady = '1';
    var canvas = document.createElement('canvas');
    canvas.className = 'spider-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    host.appendChild(canvas);
    var ctx = canvas.getContext('2d');
    var src = document.createElement('canvas');
    var sx = src.getContext('2d', { willReadFrequently: true });

    var W = 0, H = 0, dpr = 1, cols = 0, rows = 0, seeds = null, sparks = null, raf = 0, last = 0, visible = true;
    var T = CFG.tint;

    function fit() {
      var r = host.getBoundingClientRect();
      if (!r.width || !r.height) return;
      dpr = Math.min(2, window.devicePixelRatio || 1);
      W = Math.round(r.width); H = Math.round(r.height);
      canvas.width = W * dpr; canvas.height = H * dpr;
      canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
      cols = Math.floor(W / CFG.cell); rows = Math.floor(H / CFG.cell);
      // the spider is sampled at 2x the grid, then each cell averages a 2x2 block
      src.width = cols * 2; src.height = rows * 2;
      seeds = new Float32Array(cols * rows);
      for (var i = 0; i < seeds.length; i++) seeds[i] = Math.random() * 1000;
      sparks = [];
      for (var k = 0; k < Math.round(cols * rows / 90); k++) sparks.push([Math.random() * cols | 0, Math.random() * rows | 0, Math.random() * 6]);
      paint(performance.now());
    }

    function paint(now) {
      if (!cols) return;
      var t = now / 1000;
      // 1. the spider, blurred into a soft glow
      sx.filter = 'none';
      drawSpider(sx, src.width, src.height, t);
      var glow = document.createElement('canvas');
      glow.width = src.width; glow.height = src.height;
      var gx = glow.getContext('2d', { willReadFrequently: true });
      gx.filter = 'blur(' + Math.max(1, src.width / 140) + 'px)';
      gx.drawImage(src, 0, 0);
      gx.filter = 'none';
      gx.globalCompositeOperation = 'lighter';
      gx.globalAlpha = 0.65;
      gx.drawImage(src, 0, 0); // keep the legs crisp on top of the glow
      var d = gx.getImageData(0, 0, glow.width, glow.height).data, sw = glow.width;

      // 2. background
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = CFG.bg;
      ctx.fillRect(0, 0, W, H);
      var s = CFG.cell, ox = (W - cols * s) / 2, oy = (H - rows * s) / 2;

      // faint crosshair lines through the body
      ctx.fillStyle = 'rgba(40,110,255,0.10)';
      ctx.fillRect(ox + cols * s / 2, 0, 1, H);
      ctx.fillRect(0, oy + rows * s * 0.47, W, 1);

      // 3. voxels
      for (var y = 0; y < rows; y++) {
        for (var xx = 0; xx < cols; xx++) {
          var p = ((y * 2) * sw + xx * 2) * 4;
          var v = (d[p] + d[p + 4] + d[p + sw * 4] + d[p + sw * 4 + 4]) / (4 * 255);
          var i = y * cols + xx;
          var f = still ? 1 : 1 - 0.38 * (0.5 + 0.5 * Math.sin(seeds[i] + t * 7)) - (Math.sin(seeds[i] * 0.7 + t * 2.3) > 0.97 ? 0.6 : 0);
          v = v * f;
          if (v < 0.035) continue;
          var b = Math.min(1, v * 1.25);
          var size = s * (0.45 + 0.55 * b), off = (s - size) / 2, dep = Math.max(1, size * 0.3);
          // blue throughout; only the hottest cells (the core) lift toward white
          var hot = b * b * b;
          var r = T[0] + (255 - T[0]) * hot * 0.55, g = T[1] + (255 - T[1]) * hot * 0.5, bl = 255;
          var px = ox + xx * s + off, py = oy + y * s + off;
          ctx.fillStyle = 'rgba(' + (r * 0.45 | 0) + ',' + (g * 0.45 | 0) + ',' + (bl * 0.6 | 0) + ',' + (0.35 + 0.65 * b).toFixed(2) + ')';
          ctx.fillRect(px + dep, py + dep, size - dep, size - dep);
          ctx.fillStyle = 'rgba(' + (r | 0) + ',' + (g | 0) + ',' + bl + ',' + (0.25 + 0.75 * b).toFixed(2) + ')';
          ctx.fillRect(px, py, size - dep, size - dep);
        }
      }

      // 4. sparks drifting in the dark
      for (var k = 0; k < sparks.length; k++) {
        var sp = sparks[k];
        var a = still ? 0.25 : 0.15 + 0.35 * (0.5 + 0.5 * Math.sin(t * 1.7 + sp[2] * 9));
        ctx.fillStyle = 'rgba(80,150,255,' + a.toFixed(2) + ')';
        ctx.fillRect(ox + sp[0] * s + s / 3, oy + sp[1] * s + s / 3, Math.max(1, s / 3), Math.max(1, s / 3));
      }

      // 5. bloom around the body, then vignette
      var cx = W / 2, cy = oy + rows * s * 0.47;
      var bloom = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.min(W, H) * 0.45);
      bloom.addColorStop(0, 'rgba(60,140,255,0.22)');
      bloom.addColorStop(1, 'rgba(60,140,255,0)');
      ctx.globalCompositeOperation = 'lighter';
      ctx.fillStyle = bloom;
      ctx.fillRect(0, 0, W, H);
      ctx.globalCompositeOperation = 'source-over';
      var vg = ctx.createRadialGradient(cx, H / 2, Math.min(W, H) * 0.3, cx, H / 2, Math.max(W, H) * 0.75);
      vg.addColorStop(0, 'rgba(0,0,0,0)');
      vg.addColorStop(1, 'rgba(0,0,8,' + CFG.vignette + ')');
      ctx.fillStyle = vg;
      ctx.fillRect(0, 0, W, H);
    }

    function tick(now) {
      raf = 0;
      if (!visible || still) return;
      if (now - last >= 1000 / CFG.fps) { last = now; paint(now); }
      raf = requestAnimationFrame(tick);
    }
    function play() { if (!raf && visible && !still) raf = requestAnimationFrame(tick); }

    fit();
    if ('ResizeObserver' in window) new ResizeObserver(fit).observe(host);
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { visible = es[0].isIntersecting; if (visible) play(); }).observe(host);
    document.addEventListener('visibilitychange', function () { visible = document.visibilityState === 'visible'; if (visible) play(); });
    play();
  }

  function init() { document.querySelectorAll('[data-spider]').forEach(mount); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
