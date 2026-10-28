/* Shashwat Gupta — portfolio interactions. Plain JS, no dependencies.
   Each block checks for its own elements, so one file serves every page. */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  // Pages under /projects/ set data-base="../" so data paths (relative to the root) still resolve.
  var BASE = document.documentElement.getAttribute('data-base') || '';
  var PROJECTS = window.PROJECTS || [];
  var CATS = window.CATEGORIES || {};

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function projectHref(p) { return BASE + (p.page || 'projects/view.html?id=' + encodeURIComponent(p.id)); }
  function isExternal(href) { return /^https?:/.test(href); }

  /* ---------------- theme ---------------- */
  var root = document.documentElement;
  function currentTheme() {
    var t = root.getAttribute('data-theme');
    if (t) return t;
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }
  // A vanilla port of Magic UI's AnimatedThemeToggler: the new theme is revealed by a circle
  // growing out of the button, via the View Transitions API (plain swap where unsupported).
  var themeBtn = $('#themeBtn');
  if (themeBtn) themeBtn.addEventListener('click', function () {
    var next = currentTheme() === 'dark' ? 'light' : 'dark';
    function apply() {
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('sg-theme', next); } catch (e) {}
    }
    if (!document.startViewTransition || reduceMotion) { apply(); return; }
    var r = themeBtn.getBoundingClientRect();
    var cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    var radius = Math.hypot(Math.max(cx, innerWidth - cx), Math.max(cy, innerHeight - cy));
    document.startViewTransition(apply).ready.then(function () {
      root.animate(
        { clipPath: ['circle(0px at ' + cx + 'px ' + cy + 'px)', 'circle(' + radius + 'px at ' + cx + 'px ' + cy + 'px)'] },
        { duration: 450, easing: 'ease-in-out', pseudoElement: '::view-transition-new(root)' }
      );
    });
  });

  /* ---------------- nav ---------------- */
  var nav = $('#nav');
  function onScroll() { if (nav) nav.classList.toggle('scrolled', window.scrollY > 8); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  var navLinks = $$('.nav-links a[href^="#"]');
  if (navLinks.length && 'IntersectionObserver' in window) {
    var secObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        navLinks.forEach(function (a) { a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    $$('main section[id]').forEach(function (s) { secObs.observe(s); });
  }

  var year = $('#year');
  if (year) year.textContent = new Date().getFullYear();

  /* ---------------- project grid (home) ---------------- */
  function cardHTML(p) {
    var cat = CATS[p.category] || p.category;
    return '<a class="pcard' + (p.featured ? ' pcard-wide' : '') + '" href="' + esc(projectHref(p)) + '" data-cat="' + esc(p.category) + '">' +
      '<div class="pcard-body">' +
        '<span class="pcard-meta mono">' + esc(cat) + ' · ' + esc(p.year) + '</span>' +
        '<h3>' + esc(p.title) + '</h3>' +
        '<p>' + esc(p.tagline) + '</p>' +
        '<ul class="pcard-tags mono">' + p.tags.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ul>' +
        '<span class="pcard-cta mono">View project <span aria-hidden="true">→</span></span>' +
      '</div>' +
      '<div class="pcard-media"><img src="' + esc(BASE + p.image) + '" alt="" loading="lazy" decoding="async" /></div>' +
    '</a>';
  }

  (function grid() {
    var gridEl = $('#pgrid'), filtersEl = $('#filters');
    if (!gridEl) return;
    gridEl.innerHTML = PROJECTS.map(cardHTML).join('');
    $$('.pcard', gridEl).forEach(function (c) { c.setAttribute('data-reveal', ''); });

    if (!filtersEl) return;
    var used = PROJECTS.reduce(function (acc, p) { if (acc.indexOf(p.category) < 0) acc.push(p.category); return acc; }, []);
    var opts = [['all', 'All', PROJECTS.length]].concat(used.map(function (c) {
      return [c, CATS[c] || c, PROJECTS.filter(function (p) { return p.category === c; }).length];
    }));
    filtersEl.innerHTML = opts.map(function (o, i) {
      return '<button role="tab" aria-selected="' + (i === 0) + '" data-filter="' + o[0] + '">' + esc(o[1]) + ' <span class="dim">' + o[2] + '</span></button>';
    }).join('');
    filtersEl.addEventListener('click', function (e) {
      var b = e.target.closest('button');
      if (!b) return;
      var f = b.dataset.filter;
      $$('button', filtersEl).forEach(function (x) { x.setAttribute('aria-selected', x === b ? 'true' : 'false'); });
      $$('.pcard', gridEl).forEach(function (c) {
        var show = f === 'all' || c.dataset.cat === f;
        c.hidden = !show;
        if (show) c.classList.add('in');
      });
    });
  })();

  /* ---------------- shared project page (projects/view.html) ---------------- */
  (function view() {
    var el = $('#pview');
    if (!el) return;
    var id = new URLSearchParams(location.search).get('id');
    var idx = -1;
    PROJECTS.forEach(function (p, i) { if (p.id === id) idx = i; });
    var p = PROJECTS[idx];
    if (!p) {
      el.innerHTML = '<div class="wrap pv-missing"><h1 class="pv-title">Not found.</h1><p>That project isn\'t here (yet). <a class="ink-link" href="' + BASE + 'index.html#work">Back to all projects</a>.</p></div>';
      return;
    }
    if (p.page) { location.replace(BASE + p.page); return; }
    document.title = p.title + ' — Shashwat Gupta';

    var prev = PROJECTS[(idx - 1 + PROJECTS.length) % PROJECTS.length];
    var next = PROJECTS[(idx + 1) % PROJECTS.length];
    var links = (p.links || []).map(function (l) {
      var ext = isExternal(l.href);
      return '<a class="btn btn-ghost" href="' + esc(l.href) + '"' + (ext ? ' target="_blank" rel="noopener"' : '') + '>' + esc(l.label) + (ext ? ' <span aria-hidden="true">↗</span>' : '') + '</a>';
    }).join('');

    el.innerHTML =
      '<section class="pv-hero" data-paths="orbit" data-paths-opacity="0.5">' +
        '<div class="wrap">' +
          '<a class="back mono" href="' + BASE + 'index.html#work">← all projects</a>' +
          '<p class="eyebrow mono">' + esc(CATS[p.category] || p.category) + ' · ' + esc(p.year) + '</p>' +
          '<h1 class="pv-title">' + esc(p.title) + '</h1>' +
          '<p class="pv-tagline">' + esc(p.tagline) + '</p>' +
          '<ul class="pcard-tags mono">' + p.tags.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ul>' +
          (links ? '<div class="pv-links">' + links + '</div>' : '') +
        '</div>' +
      '</section>' +
      '<section class="wrap pv-main">' +
        '<div class="window"><div class="window-bar"><span class="dots" aria-hidden="true"><i></i><i></i><i></i></span><span class="mono">' + esc(p.title) + '</span></div>' +
          '<img class="pv-shot" src="' + esc(BASE + p.image) + '" alt="' + esc(p.title) + ' screenshot" /></div>' +
        '<div class="pv-text">' +
          (p.body || []).map(function (t) { return '<p>' + esc(t) + '</p>'; }).join('') +
          (p.features ? '<ul class="pv-features">' + p.features.map(function (f) { return '<li>' + esc(f) + '</li>'; }).join('') + '</ul>' : '') +
        '</div>' +
        (p.gallery ? '<div class="pv-gallery">' + p.gallery.map(function (g) { return '<img src="' + esc(BASE + g) + '" alt="" loading="lazy" />'; }).join('') + '</div>' : '') +
      '</section>' +
      '<nav class="wrap pv-pager mono" aria-label="More projects">' +
        '<a href="' + esc(projectHref(prev)) + '"><span class="dim">← previous</span>' + esc(prev.title) + '</a>' +
        '<a href="' + esc(projectHref(next)) + '"><span class="dim">next →</span>' + esc(next.title) + '</a>' +
      '</nav>';
  })();

  /* ---------------- decrypt text ---------------- */
  var GLYPHS = '!<>-_\\/[]{}=+*^?#$%&01ABCDEFGHJKLMNPQRSTUVWXYZ';
  function decrypt(el) {
    if (el.dataset.done) return;
    el.dataset.done = '1';
    var text = el.dataset.text || el.textContent;
    el.setAttribute('aria-label', text);
    if (reduceMotion) { el.textContent = text; return; }
    var frame = 0, total = 18 + text.length * 2;
    (function step() {
      var out = '';
      for (var i = 0; i < text.length; i++) {
        var ch = text[i];
        if (ch === ' ' || frame >= 8 + i * 2) out += ch;
        else out += GLYPHS[(Math.random() * GLYPHS.length) | 0];
      }
      el.textContent = out;
      if (++frame <= total) setTimeout(step, 38);
      else el.textContent = text;
    })();
  }

  /* ---------------- count up ---------------- */
  function countUp(el) {
    if (el.dataset.done) return;
    el.dataset.done = '1';
    var target = +el.dataset.count, suffix = el.dataset.suffix || '';
    var fmt = function (n) { return n.toLocaleString('en-US') + suffix; };
    if (reduceMotion) { el.textContent = fmt(target); return; }
    var start = performance.now(), dur = 1400;
    (function tick(now) {
      var p = Math.min(1, (now - start) / dur);
      el.textContent = fmt(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) requestAnimationFrame(tick);
    })(start);
  }

  /* ---------------- reveal on scroll ---------------- */
  function activate(el) {
    el.classList.add('in');
    $$('.decrypt', el).forEach(decrypt);
    $$('[data-count]', el).forEach(countUp);
  }
  if ('IntersectionObserver' in window) {
    var revObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        activate(e.target);
        revObs.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    $$('[data-reveal]').forEach(function (el) {
      // light stagger for siblings revealed together
      var sibIdx = Array.prototype.indexOf.call(el.parentNode.children, el);
      el.style.transitionDelay = Math.min(sibIdx % 6, 5) * 70 + 'ms';
      revObs.observe(el);
    });
  } else {
    $$('[data-reveal]').forEach(activate);
  }
  $$('.hero .decrypt, .pv-hero .decrypt, .tk-hero .decrypt').forEach(function (el, i) {
    setTimeout(function () { decrypt(el); }, 150 + i * 260);
  });

  /* ---------------- walker terminal ---------------- */
  // Replays Terminal_game2_basic.java (Nov 2023) using its own sprites: the player falls in from the
  // top, lands arms-up, then walks in four-frame steps of 3 columns every 200ms, as the original did.
  (function walker() {
    var term = $('#walker'), screen = $('#walkerScreen');
    if (!term || !screen) return;

    var W = 7, H = 6, ROWS = 10;
    var IDLE = [' (^_^) ', '  /|\\  ', ' / | \\ ', '   |   ', '  I+I  ', '  I I  '];
    var CHEER = ['\\(^_^)/', ' \\-|-/ ', '   |   ', '   |   ', '  |+|  ', '  | |  '];
    var WALK = [
      ['   |>  ', '   |   ', '   |   ', '   |   ', '   |   ', '   |   '],
      ['   |>  ', '  /|\\  ', ' | | | ', '   |   ', '  /|   ', ' / |   '],
      ['   |>  ', '  /|\\  ', ' / | \\ ', '   |   ', '  /\\   ', ' /  \\  '],
      ['   |>  ', '  /|\\  ', ' | | | ', '   |   ', '   |\\  ', '   | \\ ']
    ];
    var FLIP = { '/': '\\', '\\': '/', '<': '>', '>': '<', '(': ')', ')': '(' };
    function mirror(frame) {
      return frame.map(function (l) { return l.split('').reverse().map(function (c) { return FLIP[c] || c; }).join(''); });
    }
    var WALK_L = WALK.map(mirror);

    var STEP = 3, x = 0, y = -H, pose = 'fall', turn = 0, facing = 1, jump = 0, cheer = 0;
    var cols = 60, lastInput = 0, target = null, bubbleUntil = 0, timer = null;
    var bubble = "hi! i'm from nov 2023.";

    function measure() {
      var probe = document.createElement('span');
      probe.textContent = 'MMMMMMMMMM';
      probe.style.visibility = 'hidden';
      screen.appendChild(probe);
      var cw = probe.getBoundingClientRect().width / 10 || 8;
      screen.removeChild(probe);
      var pad = parseFloat(getComputedStyle(screen).paddingLeft) * 2;
      cols = Math.max(W + 2, Math.floor((screen.clientWidth - pad) / cw));
      x = Math.min(Math.max(0, x), cols - W);
    }

    function sprite() {
      if (pose === 'cheer' || pose === 'fall' || jump) return CHEER;
      if (pose === 'walk') return (facing > 0 ? WALK : WALK_L)[turn];
      return IDLE;
    }

    function draw() {
      var grid = [];
      for (var r = 0; r < ROWS; r++) grid.push(new Array(cols + 1).join(' ').split(''));
      var top = (pose === 'fall' ? y : ROWS - 1 - H) - (jump ? 3 : 0);
      sprite().forEach(function (line, i) {
        var row = top + i;
        if (row < 0 || row >= ROWS - 1) return;
        for (var c = 0; c < W; c++) if (line[c] !== ' ' && x + c < cols) grid[row][x + c] = line[c];
      });
      if (Date.now() < bubbleUntil) {
        var txt = '< ' + bubble + ' >';
        var bx = x + W + 1 + txt.length <= cols ? x + W + 1 : Math.max(0, x - txt.length - 1);
        for (var k = 0; k < txt.length && bx + k < cols; k++) grid[ROWS - 1 - H][bx + k] = txt[k];
      }
      for (var g = 0; g < cols; g++) grid[ROWS - 1][g] = '~';
      screen.textContent = grid.map(function (r) { return r.join(''); }).join('\n');
    }

    function step(d) {
      facing = d;
      var nx = Math.max(0, Math.min(cols - W, x + d * STEP));
      if (nx === x) { pose = 'idle'; return false; }
      x = nx;
      pose = 'walk';
      turn = (turn + 1) % WALK.length;
      return true;
    }

    function input(d) {
      if (pose === 'fall') return;
      lastInput = Date.now();
      target = null;
      if (d === 'jump') { if (!jump) jump = 3; }
      else step(d);
      draw();
    }

    function tick() {
      if (pose === 'fall') {
        y++;
        if (y >= ROWS - 1 - H) { pose = 'cheer'; cheer = 4; bubbleUntil = Date.now() + 4200; }
        draw();
        return;
      }
      if (jump) jump--;
      if (pose === 'cheer') { if (--cheer <= 0) pose = 'idle'; draw(); return; }
      // wander by itself when nobody is steering
      if (Date.now() - lastInput > 3000) {
        if (target === null || Math.abs(target - x) < STEP) {
          pose = 'idle';
          target = Math.random() < 0.3 ? null : Math.floor(Math.random() * (cols - W));
        } else {
          step(target > x ? 1 : -1);
        }
      } else if (pose === 'walk' && Date.now() - lastInput > 400) {
        pose = 'idle';
      }
      draw();
    }

    function start() {
      if (timer) return;
      measure();
      x = Math.floor((cols - W) / 4);
      if (reduceMotion) { pose = 'idle'; draw(); return; }
      draw();
      timer = setInterval(tick, 200);
    }

    term.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); input(1); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); input(-1); }
      else if (e.key === ' ' || e.key === 'ArrowUp') { e.preventDefault(); input('jump'); }
    });
    $$('[data-walk]', term).forEach(function (b) {
      b.addEventListener('click', function () {
        var v = b.dataset.walk;
        input(v === 'jump' ? 'jump' : +v);
      });
    });
    term.addEventListener('click', function (e) { if (!e.target.closest('button')) term.focus(); });
    window.addEventListener('resize', function () { measure(); draw(); });

    // He spawns when the terminal first comes into view, so the fall isn't missed.
    measure();
    draw();
    if ('IntersectionObserver' in window) {
      var o = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { start(); o.disconnect(); } }, { threshold: 0.4 });
      o.observe(term);
    } else start();
  })();

  /* ---------------- screenshot carousels ---------------- */
  $$('[data-shots]').forEach(function (box) {
    var imgs = $$('.shots img', box), tabs = $$('.shot-tabs button', box), i = 0, auto;
    if (!imgs.length) return;
    function show(n) {
      i = n;
      imgs.forEach(function (im, k) { im.classList.toggle('on', k === n); });
      tabs.forEach(function (t, k) { t.setAttribute('aria-selected', k === n ? 'true' : 'false'); });
    }
    tabs.forEach(function (t, k) {
      t.addEventListener('click', function () { clearInterval(auto); show(k); });
    });
    if (!reduceMotion) auto = setInterval(function () { show((i + 1) % imgs.length); }, 4200);
  });

  /* ---------------- moving-target playground (toy, Talken page) ---------------- */
  (function cipher() {
    var input = $('#plain'), chainEl = $('#chain'), out = $('#cipherOut'), reroll = $('#reroll');
    if (!input) return;
    var CHARS = '';
    for (var c = 33; c < 127; c++) CHARS += String.fromCharCode(c);
    var N = CHARS.length, POOL = 32768, chain = [], scrambleTimer;

    function rng(seed) {
      return function () {
        seed |= 0; seed = seed + 0x6D2B79F5 | 0;
        var t = Math.imul(seed ^ seed >>> 15, 1 | seed);
        t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
      };
    }
    function perm(id) {
      var r = rng(id * 2654435761), p = CHARS.split('');
      for (var i = N - 1; i > 0; i--) { var j = (r() * (i + 1)) | 0, t = p[i]; p[i] = p[j]; p[j] = t; }
      return { table: p.join(''), shift: 1 + (id % (N - 1)) };
    }
    function apply(text, id) {
      var k = perm(id), s = '';
      for (var i = 0; i < text.length; i++) {
        var idx = CHARS.indexOf(text[i]);
        if (idx < 0) idx = (text.charCodeAt(i) * 7) % N; // spaces & non-ASCII fold in too
        s += k.table[(idx + i * k.shift) % N];
      }
      return s;
    }
    function roll() {
      var len = 3 + ((Math.random() * 3) | 0);
      chain = [];
      for (var i = 0; i < len; i++) chain.push((Math.random() * POOL) | 0);
    }
    function render(animate) {
      chainEl.innerHTML = '';
      var lbl = document.createElement('span');
      lbl.textContent = 'plaintext';
      chainEl.appendChild(lbl);
      chain.forEach(function (id, i) {
        var arrow = document.createElement('span');
        arrow.textContent = '→';
        var node = document.createElement('span');
        node.className = 'node' + (i === chain.length - 1 ? ' hot' : '');
        node.textContent = 'config #' + String(id).padStart(5, '0');
        node.style.animationDelay = i * 80 + 'ms';
        chainEl.appendChild(arrow);
        chainEl.appendChild(node);
      });

      var result = chain.reduce(apply, input.value);
      clearInterval(scrambleTimer);
      if (!animate || reduceMotion) { out.textContent = result || '—'; return; }
      var f = 0;
      scrambleTimer = setInterval(function () {
        var s = '';
        for (var i = 0; i < result.length; i++) s += i < f * 3 ? result[i] : CHARS[(Math.random() * N) | 0];
        out.textContent = s || '—';
        if (f++ * 3 >= result.length) { clearInterval(scrambleTimer); out.textContent = result || '—'; }
      }, 30);
    }

    roll();
    render(false);
    input.addEventListener('input', function () { render(false); });
    reroll.addEventListener('click', function () { roll(); render(true); });
  })();
})();
