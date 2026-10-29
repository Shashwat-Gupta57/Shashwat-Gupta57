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

  var R = window.SiteRender(BASE, PROJECTS, CATS, window.DOCS, window.STRUCTURE, window.RELEASES);
  var esc = R.esc;

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

  /* ---------------- the work: flagship stack, the ls -la archive, posters ---------------- */
  // Flagships pin and stack as you scroll; everything else is a terminal-style index whose rows
  // float a preview next to the cursor.
  var FLAGSHIPS = ['talken', 'notes-plus', 'life', 'backbench', 'jctx', 'codemeter', 'drive-handler'];
  (function work() {
    var stackEl = $('#stack'), lsEl = $('#lsList'), gridEl = $('#pgrid'), filtersEl = $('#filters');
    if (stackEl) {
      var flag = FLAGSHIPS.map(function (id) { return PROJECTS.filter(function (p) { return p.id === id; })[0]; }).filter(Boolean);
      stackEl.innerHTML = flag.map(function (p, i) { return R.stackCard(p, i, flag.length); }).join('');
    }
    var listed = PROJECTS.filter(function (p) { return !(lsEl && lsEl.hasAttribute('data-exclude-flagships') && FLAGSHIPS.indexOf(p.id) >= 0); });
    if (lsEl) lsEl.innerHTML = listed.map(R.lsRow).join('');
    if (gridEl) {
      gridEl.innerHTML = PROJECTS.map(R.cardHTML).join('');
      $$('.pcard', gridEl).forEach(function (c) { c.setAttribute('data-reveal', ''); });
    }

    if (filtersEl) {
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
        $$('.pcard, .ls-row').forEach(function (c) {
          var show = f === 'all' || c.dataset.cat === f;
          c.hidden = !show;
          if (show) c.classList.add('in');
        });
      });
    }

    // list / posters toggle (work page)
    $$('.view-toggle button').forEach(function (b) {
      b.addEventListener('click', function () {
        $$('.view-toggle button').forEach(function (x) { x.setAttribute('aria-selected', x === b ? 'true' : 'false'); });
        $$('[data-view-panel]').forEach(function (pn) { pn.hidden = pn.dataset.viewPanel !== b.dataset.view; });
        $$('[data-view-panel="' + b.dataset.view + '"] [data-reveal]').forEach(function (x) { x.classList.add('in'); });
      });
    });

    // floating preview that follows the cursor over the archive (mouse only)
    var pv = $('#lsPreview');
    if (pv && lsEl && window.matchMedia('(hover: hover)').matches) {
      var pimg = $('img', pv), plabel = $('span', pv), tx = 0, ty = 0, x = 0, y = 0, raf = 0;
      var follow = function () {
        x += (tx - x) * 0.22; y += (ty - y) * 0.22;
        pv.style.transform = 'translate(' + x + 'px,' + y + 'px)';
        raf = Math.abs(tx - x) + Math.abs(ty - y) > 0.5 ? requestAnimationFrame(follow) : 0;
      };
      lsEl.addEventListener('mouseover', function (e) {
        var row = e.target.closest('.ls-row');
        if (!row) return;
        var src = row.dataset.preview || row.dataset.icon;
        pv.classList.toggle('icon-only', !row.dataset.preview);
        pv.style.setProperty('--p-to', row.style.getPropertyValue('--p-to'));
        pv.style.setProperty('--p-from', row.style.getPropertyValue('--p-from'));
        if (src) { pimg.src = src; pimg.hidden = false; } else { pimg.hidden = true; }
        plabel.textContent = $('b', row).textContent;
        pv.classList.add('on');
      });
      lsEl.addEventListener('mouseleave', function () { pv.classList.remove('on'); });
      lsEl.addEventListener('mousemove', function (e) {
        tx = e.clientX + 28; ty = e.clientY - 120;
        if (tx + 340 > innerWidth) tx = e.clientX - 368;
        if (!raf) raf = requestAnimationFrame(follow);
      });
    }
  })();

  /* ---------------- project pages (projects/<id>.html) ---------------- */
  // The page HTML is generated into each file by tools/build-pages.js (so every project has a
  // real, static URL); this only wires up its interactions.
  (function view() {
    var el = $('#pview');
    if (!el) return;
    var p = null;
    PROJECTS.forEach(function (x) { if (x.id === el.dataset.project) p = x; });
    if (!p) return;
    if (!el.children.length) el.innerHTML = R.renderProject(p); // fallback if a page wasn't generated
    var shots = p.shots || [];

    // install tabs + copy buttons
    $$('.pv-tabs', el).forEach(function (box) {
      $$('[data-tab]', box).forEach(function (b) {
        b.addEventListener('click', function () {
          $$('[data-tab]', box).forEach(function (x) { x.setAttribute('aria-selected', x === b ? 'true' : 'false'); });
          $$('[data-panel]', box).forEach(function (pn) { pn.hidden = pn.dataset.panel !== b.dataset.tab; });
        });
      });
    });
    $$('[data-copy]', el).forEach(function (b) {
      b.addEventListener('click', function () {
        var txt = b.parentNode.querySelector('pre').textContent;
        var done = function () { b.textContent = 'copied ✓'; setTimeout(function () { b.textContent = 'copy'; }, 1600); };
        if (navigator.clipboard) navigator.clipboard.writeText(txt).then(done, function () {}); else done();
      });
    });

    // API filter
    var filter = $('#apiFilter');
    if (filter) filter.addEventListener('input', function () {
      var q = filter.value.trim().toLowerCase(), any = false;
      $$('.pv-api-group', el).forEach(function (g) {
        var shown = 0;
        $$('.pv-api-item', g).forEach(function (it) {
          var hit = !q || it.textContent.toLowerCase().indexOf(q) >= 0;
          it.hidden = !hit; if (hit) shown++;
        });
        g.hidden = shown === 0; if (shown) any = true;
      });
      $('.pv-api-empty', el).hidden = any;
    });

    // screenshot lightbox
    var lb = $('#lightbox');
    if (lb) {
      var cur = 0, img = $('img', lb), cap = $('figcaption', lb), opener = null;
      var show = function (i) {
        cur = (i + shots.length) % shots.length;
        img.src = BASE + shots[cur].src; img.alt = shots[cur].caption; cap.textContent = shots[cur].caption + '  ·  ' + (cur + 1) + ' / ' + shots.length;
      };
      var open = function (i, from) { opener = from; show(i); lb.hidden = false; document.body.style.overflow = 'hidden'; $('.lb-close', lb).focus(); };
      var close = function () { lb.hidden = true; document.body.style.overflow = ''; if (opener) opener.focus(); };
      $$('[data-open]', el).forEach(function (b) { b.addEventListener('click', function () { open(+b.dataset.open, b); }); });
      $('.lb-close', lb).addEventListener('click', close);
      $('.lb-prev', lb).addEventListener('click', function () { show(cur - 1); });
      $('.lb-next', lb).addEventListener('click', function () { show(cur + 1); });
      lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
      document.addEventListener('keydown', function (e) {
        if (lb.hidden) return;
        if (e.key === 'Escape') close();
        else if (e.key === 'ArrowLeft') show(cur - 1);
        else if (e.key === 'ArrowRight') show(cur + 1);
      });
      if (shots.length < 2) $$('.lb-nav', lb).forEach(function (b) { b.hidden = true; });
    }
  })();

  /* ---------------- decrypt text ---------------- */
  var GLYPHS = '!<>-_\\/[]{}=+*^?#$%&01ABCDEFGHJKLMNPQRSTUVWXYZ';
  // Decrypts one or more elements as a single sweep: every element starts scrambled, and the
  // reveal runs left to right through the first and carries straight on into the next
  // (so a two-line name reads as one word being decoded, not two at once).
  function decrypt(els) {
    els = [].concat(els).filter(function (el) { return !el.dataset.done; });
    if (!els.length) return;
    var texts = els.map(function (el) {
      el.dataset.done = '1';
      var t = el.dataset.text || el.textContent;
      el.setAttribute('aria-label', t);
      return t;
    });
    if (reduceMotion) { els.forEach(function (el, k) { el.textContent = texts[k]; }); return; }
    var totalChars = texts.reduce(function (n, t) { return n + t.length; }, 0);
    var frame = 0, last = 8 + totalChars * 2;
    (function step() {
      var offset = 0;
      els.forEach(function (el, k) {
        var text = texts[k], out = '';
        for (var i = 0; i < text.length; i++) {
          var ch = text[i];
          if (ch === ' ' || frame >= 8 + (offset + i) * 2) out += ch;
          else out += GLYPHS[(Math.random() * GLYPHS.length) | 0];
        }
        el.textContent = out;
        offset += text.length;
      });
      if (++frame <= last) setTimeout(step, 38);
      else els.forEach(function (el, k) { el.textContent = texts[k]; });
    })();
  }

  /* ---------------- count up ---------------- */
  function countUp(el) {
    if (el.dataset.done) return;
    el.dataset.done = '1';
    var target = el.dataset.count === 'projects' ? PROJECTS.length : +el.dataset.count, suffix = el.dataset.suffix || '';
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
    $$('.decrypt', el).forEach(function (d) { decrypt(d); });
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
  // Each hero heading decodes as one sweep, first line flowing into the second.
  $$('.hero-name, .tk-title, .pv-title').forEach(function (h) {
    decrypt($$('.decrypt', h));
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
