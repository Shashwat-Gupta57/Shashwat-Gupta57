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
  function linkHref(l) { return l.internal ? BASE + l.href : l.href; }
  function linkHTML(l, cls) {
    var ext = isExternal(l.href);
    return '<a class="' + cls + '" href="' + esc(linkHref(l)) + '"' + (ext ? ' target="_blank" rel="noopener"' : '') + '>' +
      esc(l.label) + (ext ? ' <span aria-hidden="true">↗</span>' : '') + '</a>';
  }
  // The card artwork: the project's own colours with its icon, or a glyph when it has none.
  function posterHTML(p, big) {
    var pz = p.poster || { from: '#222', to: '#555', ink: '#fff', glyph: p.title.charAt(0) };
    var mark = pz.icon
      ? '<img class="poster-icon' + (pz.bare ? ' bare' : '') + (pz.pixel ? ' pixel' : '') + '" src="' + esc(BASE + pz.icon) + '" alt="" loading="lazy" decoding="async" />'
      : '<span class="poster-glyph">' + esc(pz.glyph) + '</span>';
    return '<div class="poster' + (big ? ' poster-big' : '') + '" style="--p-from:' + esc(pz.from) + ';--p-to:' + esc(pz.to) + ';--p-ink:' + esc(pz.ink) + '" aria-hidden="true">' +
      mark + '<b>' + esc(p.title) + '</b><small>' + esc(p.tagline) + '</small></div>';
  }

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
  // The whole card opens the project page (the title link is stretched over it);
  // the small outline buttons sit above that and go straight to GitHub / the website.
  function cardHTML(p) {
    var cat = CATS[p.category] || p.category;
    return '<article class="pcard" data-cat="' + esc(p.category) + '">' +
      '<div class="pcard-body">' +
        '<span class="pcard-meta mono">' + esc(cat) + ' · ' + esc(p.year) + (p.status ? ' <span class="pcard-status">' + esc(p.status) + '</span>' : '') + '</span>' +
        '<h3><a class="pcard-link" href="' + esc(projectHref(p)) + '">' + esc(p.title) + '</a></h3>' +
        '<p>' + esc(p.tagline) + '</p>' +
        '<ul class="pcard-tags mono">' + p.tags.slice(0, 5).map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ul>' +
        '<div class="pcard-actions mono">' + (p.links || []).slice(0, 2).map(function (l) { return linkHTML(l, 'pbtn'); }).join('') + '</div>' +
      '</div>' +
      posterHTML(p) +
    '</article>';
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

  /* ---------------- project pages (projects/view.html?id=…) ---------------- */
  // Each project gets a small site of its own, tinted with its poster colour. Every section is
  // optional and only renders when the project has that kind of content.
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
    var pz = p.poster || {};
    if (pz.to) {
      document.body.style.setProperty('--accent', pz.to);
      document.body.style.setProperty('--accent-soft', 'color-mix(in srgb, ' + pz.to + ' 14%, transparent)');
      document.body.classList.add('pv-site');
    }

    var cat = CATS[p.category] || p.category;
    var num = 0;
    function head(eyebrow, title, sub) {
      num++;
      return '<header class="sec-head" data-reveal><span class="sec-num mono">' + (num < 10 ? '0' : '') + num + '</span>' +
        '<div><p class="eyebrow mono">' + esc(eyebrow) + '</p><h2 class="sec-title">' + title + '</h2></div>' +
        (sub ? '<p class="sec-sub">' + esc(sub) + '</p>' : '') + '</header>';
    }
    function section(idName, inner) { return '<section class="section pv-sec" id="' + idName + '"><div class="wrap">' + inner + '</div></section>'; }

    var links = (p.links || []).map(function (l) { return linkHTML(l, 'btn btn-ghost'); }).join('');
    var mark = pz.icon
      ? '<img class="pv-logo' + (pz.bare ? ' bare' : '') + (pz.pixel ? ' pixel' : '') + '" src="' + esc(BASE + pz.icon) + '" alt="' + esc(p.title) + ' logo" />'
      : '<span class="pv-logo pv-logo-glyph mono" aria-hidden="true">' + esc(pz.glyph || p.title.charAt(0)) + '</span>';
    var shots = p.shots || [];
    var heroMedia = shots.length
      ? '<button class="pv-hero-shot window" data-open="0" aria-label="Enlarge screenshot"><div class="window-bar"><span class="dots" aria-hidden="true"><i></i><i></i><i></i></span><span class="mono">' + esc(p.title) + '</span></div><img src="' + esc(BASE + shots[0].src) + '" alt="' + esc(shots[0].caption) + '" /></button>'
      : posterHTML(p, true);

    var html =
      '<section class="pv-hero pv-hero-site" data-paths="flow" data-paths-mirror data-paths-color="' + esc(pz.to || '#888') + '" data-paths-opacity="0.55">' +
        '<div class="wrap">' +
          '<a class="back mono" href="' + BASE + 'index.html#work">← all projects</a>' +
          '<div class="pv-hero-grid">' +
            '<div class="pv-hero-copy">' + mark +
              '<p class="eyebrow mono">' + esc(cat) + ' · ' + esc(p.year) + (p.status ? ' <span class="pcard-status">' + esc(p.status) + '</span>' : '') + '</p>' +
              '<h1 class="pv-title"><span class="decrypt" data-text="' + esc(p.title) + '">' + esc(p.title) + '</span></h1>' +
              '<p class="pv-tagline">' + esc(p.tagline) + '</p>' +
              '<ul class="pcard-tags mono">' + p.tags.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ul>' +
              (links ? '<div class="pv-links">' + links + '</div>' : '') +
            '</div>' +
            '<div class="pv-hero-media">' + heroMedia + '</div>' +
          '</div>' +
          (p.stats ? '<div class="tk-facts pv-facts">' + p.stats.map(function (s) { return '<div data-reveal><b>' + esc(s[0]) + '</b><span>' + esc(s[1]) + '</span></div>'; }).join('') + '</div>' : '') +
        '</div>' +
      '</section>';

    // in-page nav for the bigger sites
    var navItems = [];
    if (p.story) navItems.push(['story', 'Story']);
    if (shots.length > 1) navItems.push(['screens', 'Screens']);
    if (p.highlights || p.features) navItems.push(['highlights', 'Highlights']);
    if (p.install) navItems.push(['install', 'Install']);
    if (p.commands) navItems.push(['commands', 'Commands']);
    if (p.api) navItems.push(['api', 'API reference']);
    if (p.build) navItems.push(['build', 'Under the hood']);
    if (navItems.length > 2) {
      html += '<nav class="pv-subnav mono" aria-label="On this page"><div class="wrap">' +
        navItems.map(function (n) { return '<a href="#' + n[0] + '">' + n[1] + '</a>'; }).join('') + '</div></nav>';
    }

    if (p.story) {
      html += section('story', head('The story', 'Why <em>' + esc(p.title) + '</em>', '') +
        '<div class="pv-story" data-reveal>' + p.story.map(function (t, i) { return '<p' + (i === 0 ? ' class="lead"' : '') + '>' + esc(t) + '</p>'; }).join('') + '</div>');
    } else if (p.body) {
      html += section('story', '<div class="pv-story" data-reveal>' + p.body.map(function (t) { return '<p>' + esc(t) + '</p>'; }).join('') + '</div>');
    }

    if (shots.length > 1) {
      html += section('screens', head('Screens', 'See it <em>running.</em>', 'Real screenshots, captured from the app itself. Click any to enlarge.') +
        '<div class="pv-shots">' + shots.map(function (s, i) {
          return '<figure data-reveal><button class="pv-shot-btn" data-open="' + i + '" aria-label="Enlarge: ' + esc(s.caption) + '"><img src="' + esc(BASE + s.src) + '" alt="' + esc(s.caption) + '" loading="lazy" decoding="async" /></button><figcaption class="mono">' + esc(s.caption) + '</figcaption></figure>';
        }).join('') + '</div>');
    }

    var hl = p.highlights || (p.features || []).map(function (f) { return { t: f, d: '' }; });
    if (hl.length) {
      html += section('highlights', head('Highlights', 'What it <em>does.</em>', '') +
        '<div class="feature-grid">' + hl.map(function (h, i) {
          return '<article data-reveal><span class="f-ico">' + (i < 9 ? '0' : '') + (i + 1) + '</span><h3>' + esc(h.t) + '</h3>' + (h.d ? '<p>' + esc(h.d) + '</p>' : '') + '</article>';
        }).join('') + '</div>');
    }

    if (p.install) {
      html += section('install', head('Install', 'Get it <em>running.</em>', '') +
        '<div class="pv-tabs" data-reveal><div class="pv-tablist mono" role="tablist">' +
          p.install.map(function (t, i) { return '<button role="tab" aria-selected="' + (i === 0) + '" data-tab="' + i + '">' + esc(t.label) + '</button>'; }).join('') +
        '</div>' + p.install.map(function (t, i) {
          return '<div class="pv-code" data-panel="' + i + '"' + (i ? ' hidden' : '') + '><pre class="mono">' + esc(t.code) + '</pre><button class="pv-copy mono" data-copy>copy</button></div>';
        }).join('') + '</div>');
    }

    if (p.commands) {
      html += section('commands', head('Commands', 'Everything it <em>can do.</em>', '') +
        '<div class="pv-cmds" data-reveal>' + p.commands.map(function (c) {
          return '<div class="pv-cmd"><code class="mono">' + esc(c.cmd) + '</code><span>' + esc(c.d) + '</span></div>';
        }).join('') + '</div>');
    }

    if (p.terminal) {
      html += '<section class="pv-sec"><div class="wrap"><div class="term pv-term" data-reveal><div class="term-bar"><span class="dots" aria-hidden="true"><i></i><i></i><i></i></span><span class="mono term-title">' + esc(p.terminal.title) + '</span></div>' +
        '<pre class="term-screen pv-term-out mono"><span class="pv-prompt">$ ' + esc(p.terminal.cmd) + '</span>\n\n' + esc(p.terminal.out) + '</pre></div></div></section>';
    }

    if (p.api) {
      var total = p.api.reduce(function (n, g) { return n + g.items.length; }, 0);
      html += section('api', head('API reference', 'The <em>docs.</em>', total + ' public methods across ' + p.api.length + ' groups. Type to filter.') +
        '<div class="pv-api" data-reveal>' +
          '<aside class="pv-api-nav mono">' + p.api.map(function (g, i) { return '<a href="#api-' + i + '">' + esc(g.group) + ' <span class="dim">' + g.items.length + '</span></a>'; }).join('') + '</aside>' +
          '<div class="pv-api-body"><label class="sr" for="apiFilter">Filter methods</label><input id="apiFilter" class="cipher-input pv-api-filter" type="search" placeholder="filter — e.g. upload, token, folder" autocomplete="off" spellcheck="false" />' +
          p.api.map(function (g, i) {
            return '<div class="pv-api-group" id="api-' + i + '"><h3 class="mono">' + esc(g.group) + '</h3>' + (g.intro ? '<p class="pv-api-intro">' + esc(g.intro) + '</p>' : '') +
              g.items.map(function (it) { return '<div class="pv-api-item"><code class="mono">' + esc(it.sig) + '</code><p>' + esc(it.d) + '</p></div>'; }).join('') + '</div>';
          }).join('') + '<p class="pv-api-empty" hidden>No methods match.</p></div>' +
        '</div>');
    }

    if (p.build) {
      html += section('build', head('Under the hood', 'How it’s <em>built.</em>', '') +
        '<dl class="pv-build" data-reveal>' + p.build.map(function (b) { return '<div><dt class="mono">' + esc(b[0]) + '</dt><dd>' + esc(b[1]) + '</dd></div>'; }).join('') + '</dl>');
    }

    var prev = PROJECTS[(idx - 1 + PROJECTS.length) % PROJECTS.length];
    var next = PROJECTS[(idx + 1) % PROJECTS.length];
    html += '<nav class="wrap pv-pager mono" aria-label="More projects">' +
      '<a href="' + esc(projectHref(prev)) + '"><span class="dim">← previous</span>' + esc(prev.title) + '</a>' +
      '<a href="' + esc(projectHref(next)) + '"><span class="dim">next →</span>' + esc(next.title) + '</a>' +
    '</nav>';

    // lightbox for screenshots
    if (shots.length) {
      html += '<div class="lightbox" id="lightbox" hidden role="dialog" aria-modal="true" aria-label="Screenshot">' +
        '<button class="lb-close mono" aria-label="Close">esc ✕</button><button class="lb-nav lb-prev" aria-label="Previous">‹</button>' +
        '<figure><img alt="" /><figcaption class="mono"></figcaption></figure><button class="lb-nav lb-next" aria-label="Next">›</button></div>';
    }

    el.innerHTML = html;

    // tabs + copy
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

    // lightbox
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
