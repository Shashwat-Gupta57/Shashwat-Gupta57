/* Shashwat Gupta — portfolio interactions. Plain JS, no dependencies. */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---------------- theme ---------------- */
  var root = document.documentElement;
  function currentTheme() {
    var t = root.getAttribute('data-theme');
    if (t) return t;
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  }
  $('#themeBtn').addEventListener('click', function () {
    var next = currentTheme() === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('sg-theme', next); } catch (e) {}
  });

  /* ---------------- nav ---------------- */
  var nav = $('#nav');
  function onScroll() { nav.classList.toggle('scrolled', window.scrollY > 8); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  var navLinks = $$('.nav-links a');
  if ('IntersectionObserver' in window) {
    var secObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        navLinks.forEach(function (a) { a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    $$('main section[id]').forEach(function (s) { secObs.observe(s); });
  }

  $('#year').textContent = new Date().getFullYear();

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
        var revealAt = 8 + i * 2;
        if (ch === ' ' || frame >= revealAt) out += ch;
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
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.12 });
    $$('[data-reveal]').forEach(function (el, i) {
      // light stagger for siblings revealed together
      var sibIdx = Array.prototype.indexOf.call(el.parentNode.children, el);
      el.style.transitionDelay = Math.min(sibIdx, 5) * 70 + 'ms';
      revObs.observe(el);
    });
  } else {
    $$('[data-reveal]').forEach(activate);
  }
  // hero name decrypts immediately
  $$('.hero .decrypt').forEach(function (el, i) { setTimeout(function () { decrypt(el); }, 150 + i * 260); });

  /* ---------------- walker terminal ---------------- */
  // A tribute to the Nov 2023 program: an 8-line character, redrawn every 500ms.
  (function walker() {
    var term = $('#walker'), screen = $('#walkerScreen');
    if (!term || !screen) return;

    var W = 9, ROWS = 11, BODY = 8;
    var heads = { idle: '  (o o)  ', right: '  ( oo)  ', left: '  (oo )  ' };
    var torso = ['   .-.   ', null, '   |=|   ', '  /| |\\  ', ' / | | \\ ', '   |_|   '];
    var legs = [['   / \\   ', '  /   \\  '], ['   | |   ', '   | |   ']];

    var x = 2, dir = 1, facing = 'idle', legFrame = 0, jump = 0;
    var lastInput = 0, target = null, cols = 60;
    var bubble = "hi! i'm from nov 2023.", bubbleUntil = Date.now() + 4500;

    function measure() {
      var probe = document.createElement('span');
      probe.textContent = 'MMMMMMMMMM';
      probe.style.visibility = 'hidden';
      screen.appendChild(probe);
      var cw = probe.getBoundingClientRect().width / 10 || 8;
      screen.removeChild(probe);
      var pad = parseFloat(getComputedStyle(screen).paddingLeft) * 2;
      cols = Math.max(W + 2, Math.floor((screen.clientWidth - pad) / cw));
      x = Math.min(x, cols - W);
    }

    function sprite() {
      var rows = torso.slice();
      rows[1] = heads[facing];
      return rows.concat(legs[legFrame]);
    }

    function draw() {
      var grid = [];
      for (var r = 0; r < ROWS; r++) grid.push(new Array(cols + 1).join(' ').split(''));
      var top = ROWS - 1 - BODY - (jump > 0 ? 2 : 0);
      sprite().forEach(function (line, i) {
        for (var c = 0; c < W; c++) if (line[c] !== ' ' && x + c < cols) grid[top + i][x + c] = line[c];
      });
      if (Date.now() < bubbleUntil) {
        var bx = Math.min(Math.max(0, x + W - 2), Math.max(0, cols - bubble.length - 4));
        var txt = '< ' + bubble + ' >';
        var br = Math.max(0, top - 1);
        for (var k = 0; k < txt.length && bx + k < cols; k++) grid[br][bx + k] = txt[k];
      }
      for (var g = 0; g < cols; g++) grid[ROWS - 1][g] = g % 2 ? '_' : '.';
      screen.textContent = grid.map(function (r) { return r.join(''); }).join('\n');
    }

    function move(d) {
      dir = d;
      facing = d > 0 ? 'right' : 'left';
      x = Math.max(0, Math.min(cols - W, x + d));
      legFrame ^= 1;
    }

    function input(d) {
      lastInput = Date.now();
      target = null;
      if (d === 'jump') { if (!jump) jump = 2; }
      else move(d);
      draw();
    }

    function tick() {
      if (jump > 0) jump--;
      // wander by itself when nobody is steering
      if (Date.now() - lastInput > 3000) {
        if (target === null || target === x) {
          target = Math.random() < 0.25 ? null : Math.floor(Math.random() * (cols - W));
          if (target === null) { facing = 'idle'; legFrame = 1; }
        }
        if (target !== null) move(target > x ? 1 : -1);
      }
      draw();
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

    measure();
    draw();
    window.addEventListener('resize', function () { measure(); draw(); });
    if (!reduceMotion) setInterval(tick, 500);
  })();

  /* ---------------- talken screenshots ---------------- */
  (function shots() {
    var imgs = $$('#shots img'), tabs = $$('.shot-tabs button'), i = 0, auto;
    if (!imgs.length) return;
    function show(n) {
      i = n;
      imgs.forEach(function (im, k) { im.classList.toggle('on', k === n); });
      tabs.forEach(function (t, k) { t.setAttribute('aria-selected', k === n ? 'true' : 'false'); });
    }
    tabs.forEach(function (t) {
      t.addEventListener('click', function () { clearInterval(auto); show(+t.dataset.shot); });
    });
    if (!reduceMotion) auto = setInterval(function () { show((i + 1) % imgs.length); }, 4200);
  })();

  /* ---------------- cipher playground (toy) ---------------- */
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
        node.textContent = 'cipher #' + String(id).padStart(5, '0');
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
