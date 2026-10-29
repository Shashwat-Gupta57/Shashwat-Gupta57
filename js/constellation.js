/* The constellation: every project as a card on one web you can drag around and zoom into.
   The spider sits in the middle, the projects gather into clusters around it, and the lines are
   real: what grew into what, what powers what. Hover a card to light up everything it touches,
   pick a language to draw the constellation of everything built with it.
   Usage: <div data-constellation><div class="spider-box" data-spider></div></div>, mounted by
   main.js with SiteMap.mount(el, { projects, base, esc, href }). Returns { query, clear }. */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var coarse = window.matchMedia('(pointer: coarse)').matches;

  // clusters sit on an ellipse around the spider, neighbours placed so their links stay short
  var CLUSTERS = [
    { key: 'tools', name: 'Dev tools', cats: ['tools'], angle: -90 },
    { key: 'talken', name: 'The Talken system', cats: ['talken'], angle: -30 },
    { key: 'games', name: 'Games', cats: ['game'], angle: 40 },
    { key: 'desktop', name: 'Desktop & widgets', cats: ['desktop', 'widget'], angle: 140 },
    { key: 'products', name: 'Products', cats: ['cross', 'android', 'web'], angle: -150 },
    { key: 'other', name: 'Everything else', cats: [], angle: 90 }
  ];
  var RX = 1300, RY = 820;
  var T1 = ['talken', 'notes-plus'];
  var T2 = ['life', 'backbench', 'expenses', 'workdesk', 'jctx', 'codemeter', 'nglobe', 'drive-handler',
            'notes', 'sg-paint', 'widgets', 'rex-run', 'terminal-game'];
  // the real threads between projects; '#key' is a whole cluster
  var LINKS = [
    ['notes', 'notes-plus', 'became'],
    ['drive-handler', 'talken', 'keeps its files'],
    ['talken-rest-api', 'talken', 'finds its peers'],
    ['talken-toolkit', 'talken', 'updates it'],
    ['jctx', 'talken', 'built for its code'],
    ['terminal-game', 'cps-tester', 'then a window'],
    ['cps-tester', 'rex-run', 'then a game'],
    ['jre-installer', '#games', 'runs them all'],
    ['jre-installer', '#desktop', 'runs them all']
  ];
  var CHIPS = ['Java', 'Swing', 'JavaFX', 'Kotlin', 'Android', 'Python', 'Firebase', 'CLI'];
  var PAD_IN = 84, PAD_OUT = 280;     // whitespace between cards, and between clusters
  var FAR = 0.58, MAX_S = 1.6;        // below FAR the cards collapse to icon + title
  var MONTHS = 'jan feb mar apr may jun jul aug sep oct nov dec'.split(' ');

  function tagKey(t) { return String(t).replace(/\s+\d+(\.\d+)?$/, '').toLowerCase(); }
  function when(y) {
    var s = String(y).toLowerCase(), m = s.match(/(\d{4})/);
    if (!m) return 9999;
    var mi = MONTHS.indexOf(s.slice(0, 3));
    return +m[1] + (mi >= 0 ? (mi + .5) / 12 : .99);
  }

  function mount(host, ctx) {
    var esc = ctx.esc, BASE = ctx.base || '', P = ctx.projects || [];
    var spider = host.querySelector('[data-spider]');
    if (spider) spider.parentNode.removeChild(spider);

    // catalogue numbers in the order they were built
    var num = {};
    P.slice().sort(function (a, b) { return when(a.year) - when(b.year) || P.indexOf(a) - P.indexOf(b); })
      .forEach(function (p, i) { num[p.id] = i + 1; });

    // technologies that only a few projects share make the interesting threads
    var tagCount = {}, tagName = {};
    P.forEach(function (p) { (p.tags || []).forEach(function (t) { var k = tagKey(t); tagCount[k] = (tagCount[k] || 0) + 1; tagName[k] = tagName[k] || t.replace(/\s+\d+(\.\d+)?$/, ''); }); });
    function distinct(p) { return (p.tags || []).map(tagKey).filter(function (k) { return tagCount[k] >= 2 && tagCount[k] <= 5; }); }

    /* ---------- markup ---------- */
    var clusterOf = {};
    CLUSTERS.forEach(function (c) { c.cats.forEach(function (k) { clusterOf[k] = c; }); c.members = []; });
    P.forEach(function (p) { (clusterOf[p.category] || CLUSTERS[CLUSTERS.length - 1]).members.push(p); });
    var groups = CLUSTERS.filter(function (c) { return c.members.length; });

    function tierOf(p) { return T1.indexOf(p.id) >= 0 ? 1 : T2.indexOf(p.id) >= 0 ? 2 : 3; }
    function iconHTML(p) {
      var pz = p.poster || {};
      return pz.icon
        ? '<img class="cn-icon' + (pz.bare ? ' bare' : '') + (pz.pixel ? ' pixel' : '') + '" src="' + esc(BASE + pz.icon) + '" alt="" draggable="false" />'
        : '<span class="cn-icon cn-glyph mono" style="color:' + esc(pz.ink || '#fff') + '">' + esc(pz.glyph || p.title.charAt(0)) + '</span>';
    }
    function cardHTML(p) {
      var pz = p.poster || {}, tier = tierOf(p), n = num[p.id];
      var img = tier === 1 && (p.cover || (p.shots && p.shots[0] && p.shots[0].src));
      var tags = (p.tags || []).slice(0, tier === 1 ? 4 : 3).join(' · ');
      return '<a class="cn-card t' + tier + '" href="' + esc(ctx.href(p)) + '" data-id="' + esc(p.id) + '" data-cat="' + esc(p.category) + '" draggable="false"' +
        ' style="--p-from:' + esc(pz.from || '#222') + ';--p-to:' + esc(pz.to || '#888') + '">' +
        (img ? '<span class="cn-shot"><img src="' + esc(BASE + img) + '" alt="' + esc(p.title) + '" loading="lazy" decoding="async" draggable="false" /></span>' : '') +
        '<span class="cn-head">' + iconHTML(p) + '<span class="cn-code mono">SG·' + (n < 10 ? '0' : '') + n + '</span><span class="cn-year mono">' + esc(p.year) + '</span></span>' +
        '<span class="cn-title">' + esc(p.title) + '</span>' +
        '<span class="cn-line">' + esc(p.tagline) + '</span>' +
        (tier < 3 && tags ? '<span class="cn-tags mono">' + esc(tags) + '</span>' : '') +
        (tier === 1 && p.stats ? '<span class="cn-stats">' + p.stats.slice(0, 3).map(function (s) { return '<span><b>' + esc(s[0]) + '</b><i>' + esc(s[1]) + '</i></span>'; }).join('') + '</span>' : '') +
        '<span class="cn-far" aria-hidden="true">' + iconHTML(p) + '<b>' + esc(p.title) + '</b></span>' +
      '</a>';
    }
    function span(g) {
      var ys = g.members.map(function (p) { return Math.floor(when(p.year)); }).filter(function (y) { return y < 9999; });
      var lo = Math.min.apply(null, ys), hi = Math.max.apply(null, ys);
      var now = g.members.some(function (p) { return /now/.test(p.year); });
      return lo + (now ? ' → now' : hi > lo ? ' → ' + hi : '');
    }

    host.innerHTML =
      '<div class="cn-bar">' +
        '<label class="cn-find mono"><span aria-hidden="true">⌕</span><input type="search" placeholder="find a project, a language…" aria-label="Find a project" /></label>' +
        '<div class="cn-chips mono" role="group" aria-label="Light up a technology"><span>light up</span>' +
          CHIPS.filter(function (c) { return tagCount[tagKey(c)] >= 2; }).map(function (c) { return '<button type="button" aria-pressed="false" data-tag="' + esc(tagKey(c)) + '">' + esc(c) + '</button>'; }).join('') +
        '</div>' +
      '</div>' +
      '<div class="cn-stage"><div class="cn-view" tabindex="0" role="region" aria-roledescription="map" aria-label="Map of every project. Drag to explore; Ctrl and scroll, or the buttons, to zoom.">' +
        '<div class="cn-world">' +
          '<svg class="cn-svg" aria-hidden="true"><g class="cn-web"></g><g class="cn-links"></g><g class="cn-tagedges"></g><g class="cn-mst"></g></svg>' +
          '<div class="cn-core" data-node="#core"><p class="mono">shashwat@flex · ' + P.length + ' projects</p></div>' +
          groups.map(function (g) {
            return '<div class="cn-label" data-node="#' + g.key + '"><h3>' + esc(g.name) + '</h3><p class="mono">' + g.members.length + ' project' + (g.members.length > 1 ? 's' : '') + ' · ' + esc(span(g)) + '</p></div>';
          }).join('') +
          groups.map(function (g) {
            return g.members.slice().sort(function (a, b) { return tierOf(a) - tierOf(b) || num[a.id] - num[b.id]; }).map(cardHTML).join('');
          }).join('') +
        '</div>' +
        '<div class="cn-ui cn-jump mono" role="group" aria-label="Jump to a cluster">' +
          groups.map(function (g) { return '<button type="button" data-jump="#' + g.key + '">' + esc(g.name) + '</button>'; }).join('') +
        '</div>' +
        '<div class="cn-ui cn-zoom" role="group" aria-label="Zoom">' +
          '<button type="button" data-zoom="in" aria-label="Zoom in">+</button>' +
          '<button type="button" data-zoom="out" aria-label="Zoom out">−</button>' +
          '<button type="button" data-zoom="fit" aria-label="Show everything"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg></button>' +
          '<button type="button" data-zoom="full" aria-label="Full screen"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 4H4v5M15 4h5v5M9 20H4v-5M15 20h5v-5"/></svg></button>' +
        '</div>' +
        '<canvas class="cn-ui cn-mini" aria-hidden="true"></canvas>' +
        '<p class="cn-ui cn-hint mono">' + (coarse ? 'drag to explore · pinch to zoom' : 'drag to explore · ctrl + scroll to zoom · click to zoom in') + '</p>' +
        '<button type="button" class="cn-ui cn-close mono" aria-label="Close the full-screen map">esc ✕</button>' +
        (coarse ? '<button type="button" class="cn-explore"><span class="mono">tap to explore the map ↗</span></button>' : '') +
      '</div></div>';

    var view = host.querySelector('.cn-view'), world = host.querySelector('.cn-world');
    var svg = host.querySelector('.cn-svg'), gWeb = svg.querySelector('.cn-web'), gLinks = svg.querySelector('.cn-links');
    var gTag = svg.querySelector('.cn-tagedges'), gMst = svg.querySelector('.cn-mst');
    var mini = host.querySelector('.cn-mini'), mctx = mini.getContext('2d'), hint = host.querySelector('.cn-hint');
    var core = host.querySelector('.cn-core');
    if (spider) core.insertBefore(spider, core.firstChild);

    var byId = {}, nodes = [];
    P.forEach(function (p) { byId[p.id] = p; });
    Array.prototype.forEach.call(world.querySelectorAll('.cn-card, .cn-label, .cn-core'), function (el) {
      var id = el.dataset.id || el.dataset.node, n = { id: id, el: el, card: el.classList.contains('cn-card') };
      if (n.card) n.p = byId[id];
      nodes.push(n); nodes[id] = n;
    });

    /* ---------- layout: seed a spiral per cluster, then pull together and push apart ---------- */
    var W = 0, H = 0, built = false;
    function layout() {
      nodes.forEach(function (n) { n.w = n.el.offsetWidth; n.h = n.el.offsetHeight; });
      var coreN = nodes['#core'];
      coreN.x = 0; coreN.y = 0; coreN.fixed = true; coreN.g = 'core';
      groups.forEach(function (g) {
        var a = g.angle * Math.PI / 180, cx = Math.cos(a) * RX, cy = Math.sin(a) * RY;
        var list = [nodes['#' + g.key]].concat(g.members.slice().sort(function (x, y) { return tierOf(x) - tierOf(y) || num[x.id] - num[y.id]; }).map(function (p) { return nodes[p.id]; }));
        list.forEach(function (n, i) {
          var r = i ? 190 * Math.sqrt(i) : 0, t = i * 2.39996 + a;
          n.x = cx + Math.cos(t) * r * 1.3; n.y = cy + Math.sin(t) * r;
          n.cx = cx; n.cy = cy; n.g = g.key; n.k = i ? .03 : .2;
        });
      });
      var live = nodes.filter(function (n) { return !n.fixed; });
      for (var it = 0; it < 760; it++) {
        if (it < 700) live.forEach(function (n) { var k = it > 450 ? n.k / 3 : n.k; n.x += (n.cx - n.x) * k; n.y += (n.cy - n.y) * k; });
        for (var i = 0; i < nodes.length; i++) for (var j = i + 1; j < nodes.length; j++) {
          var a = nodes[i], b = nodes[j], pad = a.g === b.g ? PAD_IN : PAD_OUT;
          var dx = b.x - a.x, dy = b.y - a.y;
          var ox = (a.w + b.w) / 2 + pad - Math.abs(dx), oy = (a.h + b.h) / 2 + pad - Math.abs(dy);
          if (ox <= 0 || oy <= 0) continue;
          var sx = 0, sy = 0;
          if (ox < oy) sx = (dx < 0 ? -1 : 1) * ox; else sy = (dy < 0 ? -1 : 1) * oy;
          if (a.fixed) { b.x += sx; b.y += sy; }
          else if (b.fixed) { a.x -= sx; a.y -= sy; }
          else { a.x -= sx / 2; a.y -= sy / 2; b.x += sx / 2; b.y += sy / 2; }
        }
      }
      var M = 280, minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      nodes.forEach(function (n) {
        minX = Math.min(minX, n.x - n.w / 2); maxX = Math.max(maxX, n.x + n.w / 2);
        minY = Math.min(minY, n.y - n.h / 2); maxY = Math.max(maxY, n.y + n.h / 2);
      });
      W = Math.round(maxX - minX + 2 * M); H = Math.round(maxY - minY + 2 * M);
      var ox0 = M - minX, oy0 = M - minY;
      nodes.forEach(function (n) {
        n.x += ox0; n.y += oy0; n.l = n.x - n.w / 2; n.t = n.y - n.h / 2;
        n.el.style.left = Math.round(n.l) + 'px'; n.el.style.top = Math.round(n.t) + 'px';
        if (n.card) n.el.style.height = n.h + 'px';
      });
      world.style.width = W + 'px'; world.style.height = H + 'px';
      svg.setAttribute('width', W); svg.setAttribute('height', H); svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
      drawWeb(); drawLinks();
      var mw = 180, mh = Math.round(mw * H / W);
      if (mh > 130) { mh = 130; mw = Math.round(mh * W / H); }
      mini.width = mw * 2; mini.height = mh * 2; mini.style.width = mw + 'px'; mini.style.height = mh + 'px';
    }

    var NS = 'http://www.w3.org/2000/svg';
    function el(tag, attrs, parent) {
      var e = document.createElementNS(NS, tag);
      for (var k in attrs) e.setAttribute(k, attrs[k]);
      if (parent) parent.appendChild(e);
      return e;
    }
    // the spider's web: spokes out of the middle, rings that sag between them, a thread to each cluster
    function drawWeb() {
      gWeb.innerHTML = '';
      var c = nodes['#core'], R = Math.hypot(Math.max(c.x, W - c.x), Math.max(c.y, H - c.y));
      var SP = 18, ang = [];
      for (var i = 0; i < SP; i++) ang.push((i + (i % 3 ? .18 : -.12)) / SP * Math.PI * 2);
      ang.forEach(function (a) { el('path', { d: 'M' + c.x + ' ' + c.y + 'L' + (c.x + Math.cos(a) * R) + ' ' + (c.y + Math.sin(a) * R) }, gWeb); });
      for (var r = 300; r < R; r *= 1.42) {
        var pts = ang.map(function (a, i) { var rr = r * (1 + ((i * 7) % 5 - 2) * .025); return [c.x + Math.cos(a) * rr, c.y + Math.sin(a) * rr]; });
        var d = 'M' + pts[0][0] + ' ' + pts[0][1];
        pts.forEach(function (p, i) {
          var q = pts[(i + 1) % pts.length], mx = (p[0] + q[0]) / 2, my = (p[1] + q[1]) / 2;
          d += 'Q' + (c.x + (mx - c.x) * .93) + ' ' + (c.y + (my - c.y) * .93) + ' ' + q[0] + ' ' + q[1];
        });
        el('path', { d: d }, gWeb);
      }
      groups.forEach(function (g) {
        var n = nodes['#' + g.key];
        el('path', { d: 'M' + c.x + ' ' + c.y + 'L' + n.x + ' ' + n.y, 'class': 'thread' }, gWeb);
      });
    }
    // where the line from a's centre towards (x, y) leaves a's box, plus a little gap
    function edgeOf(a, x, y) {
      var dx = x - a.x, dy = y - a.y;
      var t = Math.min(dx ? (a.w / 2 + 10) / Math.abs(dx) : Infinity, dy ? (a.h / 2 + 10) / Math.abs(dy) : Infinity, 1);
      return { x: a.x + dx * t, y: a.y + dy * t };
    }
    // a gentle curve between the edges of two boxes, so the line and its label stay visible
    function curve(a0, b0, bend) {
      var a = edgeOf(a0, b0.x, b0.y), b = edgeOf(b0, a0.x, a0.y);
      var dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy) || 1;
      var cx = (a.x + b.x) / 2 - dy / len * len * bend, cy = (a.y + b.y) / 2 + dx / len * len * bend;
      return { d: 'M' + a.x + ' ' + a.y + 'Q' + cx + ' ' + cy + ' ' + b.x + ' ' + b.y,
               mx: .25 * a.x + .5 * cx + .25 * b.x, my: .25 * a.y + .5 * cy + .25 * b.y };
    }
    var edges = [];
    function drawLinks() {
      gLinks.innerHTML = ''; edges = [];
      LINKS.forEach(function (l) {
        var a = nodes[l[0]], b = nodes[l[1]];
        if (!a || !b) return;
        var c = curve(a, b, .12);
        edges.push({ a: l[0], b: l[1],
          path: el('path', { d: c.d }, gLinks),
          text: (function () { var t = el('text', { x: c.mx, y: c.my, 'text-anchor': 'middle', 'dominant-baseline': 'middle' }, gLinks); t.textContent = l[2]; return t; })() });
      });
    }

    /* ---------- the camera ---------- */
    var tx = 0, ty = 0, s = 1, vw = 0, vh = 0, minS = .2, far = false, anim = 0, settleT = 0, full = false;
    function clampView() {
      s = Math.max(minS, Math.min(MAX_S, s));
      tx = Math.min(vw * .5, Math.max(vw * .5 - W * s, tx));
      ty = Math.min(vh * .5, Math.max(vh * .5 - H * s, ty));
    }
    function apply() {
      world.style.transform = 'translate(' + tx + 'px,' + ty + 'px) scale(' + s + ')';
      var f = far ? s < FAR + .04 : s < FAR;
      if (f !== far) { far = f; view.classList.toggle('far', far); }
      drawMini();
    }
    function moving() { clearTimeout(settleT); view.classList.add('moving'); }
    // drop will-change once still, so the browser re-rasterises the text crisply at the new scale
    function settle() { clearTimeout(settleT); settleT = setTimeout(function () { view.classList.remove('moving'); }, 160); }
    function stop() { if (anim) { cancelAnimationFrame(anim); anim = 0; } }
    function viewFor(x, y, w, h, maxS, pad) {
      pad = pad == null ? 60 : pad;
      var ns = Math.max(minS, Math.min(maxS || 1, (vw - 2 * pad) / w, (vh - 2 * pad) / h));
      return { s: ns, tx: vw / 2 - (x + w / 2) * ns, ty: vh / 2 - (y + h / 2) * ns };
    }
    function fly(t, dur) {
      stop();
      if (reduceMotion || dur === 0) { tx = t.tx; ty = t.ty; s = t.s; clampView(); apply(); return; }
      dur = dur || 700;
      // glide the centre point and the scale, so the zoom doesn't drift sideways
      var s0 = s, c0x = (vw / 2 - tx) / s, c0y = (vh / 2 - ty) / s, c1x = (vw / 2 - t.tx) / t.s, c1y = (vh / 2 - t.ty) / t.s, t0 = null;
      moving();
      anim = requestAnimationFrame(function step(now) {
        if (t0 === null) t0 = now;   // time from the first frame, whatever clock it uses
        var k = Math.min(1, Math.max(0, (now - t0) / dur)), e = k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
        s = s0 * Math.pow(t.s / s0, e);
        tx = vw / 2 - (c0x + (c1x - c0x) * e) * s; ty = vh / 2 - (c0y + (c1y - c0y) * e) * s;
        apply();
        if (k < 1) anim = requestAnimationFrame(step); else { anim = 0; clampView(); apply(); settle(); }
      });
    }
    function zoomAt(px, py, f) {
      stop(); moving();
      var wx = (px - tx) / s, wy = (py - ty) / s;
      s = Math.max(minS, Math.min(MAX_S, s * f));
      tx = px - wx * s; ty = py - wy * s;
      clampView(); apply(); settle();
    }
    function bbox(list) {
      var x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
      list.forEach(function (n) { x0 = Math.min(x0, n.l); y0 = Math.min(y0, n.t); x1 = Math.max(x1, n.l + n.w); y1 = Math.max(y1, n.t + n.h); });
      return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
    }
    function fitAll(dur) { var b = bbox(nodes); fly(viewFor(b.x, b.y, b.w, b.h, 1, 30), dur); }
    function focusNode(n, scale) { fly(viewFor(n.l, n.t, n.w, n.h, scale || 1, 80)); }
    function cluster(key) {
      var list = nodes.filter(function (n) { return n.g === key; });
      var b = bbox(list); fly(viewFor(b.x, b.y, b.w, b.h, 1, 50));
    }

    /* ---------- minimap ---------- */
    var miniQ = 0;
    function drawMini() {
      if (miniQ || !W) return;
      miniQ = requestAnimationFrame(function () {
        miniQ = 0;
        var k = mini.width / W;
        mctx.clearRect(0, 0, mini.width, mini.height);
        nodes.forEach(function (n) {
          if (n.id === '#core') { mctx.fillStyle = '#1e6fff'; mctx.beginPath(); mctx.arc(n.x * k, n.y * k, n.w / 2 * k, 0, 7); mctx.fill(); return; }
          if (!n.card) return;
          var dim = view.classList.contains('is-query') && !n.el.classList.contains('match');
          mctx.globalAlpha = dim ? .2 : .85;
          mctx.fillStyle = (n.p.poster && n.p.poster.to) || '#888';
          mctx.fillRect(n.l * k, n.t * k, Math.max(2, n.w * k), Math.max(2, n.h * k));
        });
        mctx.globalAlpha = 1;
        mctx.strokeStyle = '#ff6a3d'; mctx.lineWidth = 2;
        mctx.strokeRect(-tx / s * k, -ty / s * k, vw / s * k, vh / s * k);
      });
    }
    function miniJump(e) {
      var r = mini.getBoundingClientRect(), k = r.width / W;
      var wx = (e.clientX - r.left) / k, wy = (e.clientY - r.top) / k;
      stop(); tx = vw / 2 - wx * s; ty = vh / 2 - wy * s; clampView(); apply();
    }
    mini.addEventListener('pointerdown', function (e) {
      e.stopPropagation(); mini.setPointerCapture(e.pointerId); miniJump(e);
      function mv(ev) { miniJump(ev); }
      function up() { mini.removeEventListener('pointermove', mv); mini.removeEventListener('pointerup', up); }
      mini.addEventListener('pointermove', mv); mini.addEventListener('pointerup', up);
    });

    /* ---------- dragging, pinching, wheel ---------- */
    var ptrs = {}, drag = null, dragged = false, pinch = null;
    function interactive() { return !coarse || full; }
    view.addEventListener('pointerdown', function (e) {
      if (!interactive() || e.target.closest('.cn-ui') || (e.pointerType === 'mouse' && e.button !== 0)) return;
      ptrs[e.pointerId] = { x: e.clientX, y: e.clientY };
      var ids = Object.keys(ptrs);
      stop();
      if (ids.length === 1) { drag = { x: e.clientX, y: e.clientY, tx: tx, ty: ty }; dragged = false; }
      else if (ids.length === 2) {
        var a = ptrs[ids[0]], b = ptrs[ids[1]], r = view.getBoundingClientRect();
        pinch = { d: Math.hypot(a.x - b.x, a.y - b.y) || 1, mx: (a.x + b.x) / 2 - r.left, my: (a.y + b.y) / 2 - r.top, s: s, tx: tx, ty: ty };
        drag = null; dragged = true;
        Object.keys(ptrs).forEach(function (id) { try { view.setPointerCapture(+id); } catch (x) {} });
      }
    });
    view.addEventListener('pointermove', function (e) {
      if (!ptrs[e.pointerId]) return;
      ptrs[e.pointerId] = { x: e.clientX, y: e.clientY };
      var ids = Object.keys(ptrs);
      if (pinch && ids.length === 2) {
        var a = ptrs[ids[0]], b = ptrs[ids[1]], r = view.getBoundingClientRect();
        var mx = (a.x + b.x) / 2 - r.left, my = (a.y + b.y) / 2 - r.top;
        var wx = (pinch.mx - pinch.tx) / pinch.s, wy = (pinch.my - pinch.ty) / pinch.s;
        moving();
        s = Math.max(minS, Math.min(MAX_S, pinch.s * Math.hypot(a.x - b.x, a.y - b.y) / pinch.d));
        tx = mx - wx * s; ty = my - wy * s;
        clampView(); apply();
        return;
      }
      if (!drag) return;
      var dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      if (!dragged && Math.abs(dx) + Math.abs(dy) > 5) {
        dragged = true; try { view.setPointerCapture(e.pointerId); } catch (x) {} view.classList.add('dragging'); moving(); unlight();
      }
      if (dragged) { tx = drag.tx + dx; ty = drag.ty + dy; clampView(); apply(); }
    });
    function lift(e) {
      delete ptrs[e.pointerId];
      var left = Object.keys(ptrs).length;
      if (left < 2) pinch = null;
      if (!left) { drag = null; view.classList.remove('dragging'); settle(); }
    }
    view.addEventListener('pointerup', lift);
    view.addEventListener('pointercancel', lift);
    view.addEventListener('dragstart', function (e) { e.preventDefault(); });

    // a drag never opens the card it started on; zoomed out, a click zooms in instead of opening
    view.addEventListener('click', function (e) {
      if (dragged) { e.preventDefault(); e.stopPropagation(); dragged = false; return; }
      var t = e.target.closest('.cn-card, .cn-label');
      if (!t || !world.contains(t)) return;
      if (t.classList.contains('cn-label')) { e.preventDefault(); cluster(t.dataset.node.slice(1)); }
      else if (far) { e.preventDefault(); focusNode(nodes[t.dataset.id], 1); }
    }, true);

    view.addEventListener('wheel', function (e) {
      var r = view.getBoundingClientRect();
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        zoomAt(e.clientX - r.left, e.clientY - r.top, Math.exp(-e.deltaY * (e.deltaMode ? .05 : .0022)));
      } else if (full || Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        e.preventDefault(); stop(); moving();
        tx -= e.deltaX; ty -= full ? e.deltaY : 0; clampView(); apply(); settle();
      } else flashHint();
    }, { passive: false });
    var hintT = 0;
    function flashHint() {
      hint.classList.add('flash'); clearTimeout(hintT);
      hintT = setTimeout(function () { hint.classList.remove('flash'); }, 1400);
    }

    /* ---------- buttons and keys ---------- */
    host.querySelector('.cn-zoom').addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      var z = b.dataset.zoom;
      if (z === 'in') zoomAt(vw / 2, vh / 2, 1.35);
      else if (z === 'out') zoomAt(vw / 2, vh / 2, 1 / 1.35);
      else if (z === 'fit') fitAll();
      else setFull(!full);
    });
    host.querySelector('.cn-jump').addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (b) cluster(b.dataset.jump.slice(1));
    });
    host.querySelector('.cn-close').addEventListener('click', function () { setFull(false); });
    var explore = host.querySelector('.cn-explore');
    if (explore) explore.addEventListener('click', function () { setFull(true); });
    function setFull(on) {
      full = on;
      view.classList.toggle('full', on);
      document.documentElement.classList.toggle('cn-locked', on);
      if (on) view.focus({ preventScroll: true });
    }
    view.addEventListener('keydown', function (e) {
      if (e.target.tagName === 'INPUT') return;
      var k = e.key, step = 90;
      if (k === 'Escape' && full) { setFull(false); return; }
      if (k === '+' || k === '=') zoomAt(vw / 2, vh / 2, 1.25);
      else if (k === '-' || k === '_') zoomAt(vw / 2, vh / 2, .8);
      else if (k === '0') fitAll();
      else if (/^Arrow/.test(k)) {
        stop();
        if (k === 'ArrowLeft') tx += step; if (k === 'ArrowRight') tx -= step;
        if (k === 'ArrowUp') ty += step; if (k === 'ArrowDown') ty -= step;
        clampView(); apply();
      } else return;
      e.preventDefault();
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && full) setFull(false); });

    /* ---------- lighting up: hover a card, or query a technology / category / text ---------- */
    var lit = null;
    function light(card) {
      if (lit === card) return;
      unlight(); lit = card;
      var id = card.dataset.id, p = byId[id];
      view.classList.add('is-lit'); card.classList.add('lit');
      edges.forEach(function (ed) {
        var on = ed.a === id || ed.b === id;
        ed.path.classList.toggle('lit', on); ed.text.classList.toggle('lit', on);
        if (on) nodes[ed.a === id ? ed.b : ed.a].el.classList.add('lit');
      });
      var mine = distinct(p), a = nodes[id], shown = 0;
      P.forEach(function (q) {
        if (q.id === id || shown > 7) return;
        var shared = distinct(q).filter(function (k) { return mine.indexOf(k) >= 0; });
        if (!shared.length) return;
        var b = nodes[q.id], c = curve(a, b, -.08);
        el('path', { d: c.d }, gTag);
        var t = el('text', { x: c.mx, y: c.my, 'text-anchor': 'middle', 'dominant-baseline': 'middle' }, gTag);
        t.textContent = shared.map(function (k) { return tagName[k]; }).join(' · ');
        b.el.classList.add('lit'); shown++;
      });
    }
    function unlight() {
      if (!lit) return;
      lit = null; view.classList.remove('is-lit');
      Array.prototype.forEach.call(world.querySelectorAll('.lit'), function (x) { x.classList.remove('lit'); });
      gTag.innerHTML = '';
    }
    world.addEventListener('mouseover', function (e) {
      if (dragged || anim) return;
      var c = e.target.closest('.cn-card'); if (c) light(c);
    });
    world.addEventListener('mouseout', function (e) {
      var c = e.target.closest('.cn-card');
      if (c && !c.contains(e.relatedTarget)) unlight();
    });
    world.addEventListener('focusin', function (e) {
      var c = e.target.closest('.cn-card'); if (!c) return;
      light(c);
      var n = nodes[c.dataset.id], x = n.l * s + tx, y = n.t * s + ty;
      if (far || x < 20 || y < 20 || x + n.w * s > vw - 20 || y + n.h * s > vh - 20) focusNode(n, Math.max(s, .85));
    });
    world.addEventListener('focusout', unlight);

    var chips = host.querySelector('.cn-chips'), find = host.querySelector('.cn-find input');
    // the constellation of a query: the shortest set of lines joining every match (Prim's tree)
    function drawTree(list) {
      gMst.innerHTML = '';
      if (list.length < 2) return;
      var inTree = [list[0]], rest = list.slice(1);
      while (rest.length) {
        var best = null, bi = 0, bd = Infinity;
        inTree.forEach(function (a) { rest.forEach(function (b, i) { var d = Math.hypot(a.x - b.x, a.y - b.y); if (d < bd) { bd = d; best = [a, b]; bi = i; } }); });
        var p = el('path', { d: 'M' + best[0].x + ' ' + best[0].y + 'L' + best[1].x + ' ' + best[1].y }, gMst);
        p.style.setProperty('--len', Math.ceil(bd));
        p.style.animationDelay = (inTree.length * 60) + 'ms';
        inTree.push(rest.splice(bi, 1)[0]);
      }
    }
    function query(q) {
      unlight();
      var matches = nodes.filter(function (n) {
        if (!n.card) return false;
        var p = n.p;
        if (q.tag) return (p.tags || []).some(function (t) { return tagKey(t) === q.tag; });
        if (q.cat) return p.category === q.cat;
        var hay = (p.title + ' ' + p.tagline + ' ' + (p.tags || []).join(' ') + ' ' + p.category).toLowerCase();
        return q.text.toLowerCase().split(/\s+/).every(function (w) { return hay.indexOf(w) >= 0; });
      });
      nodes.forEach(function (n) { if (n.card) n.el.classList.toggle('match', matches.indexOf(n) >= 0); });
      view.classList.add('is-query');
      drawTree(matches); drawMini();
      if (matches.length) { var b = bbox(matches); fly(viewFor(b.x, b.y, b.w, b.h, 1, 70)); }
      else { hint.textContent = 'nothing matches “' + (q.text || q.tag || q.cat) + '”'; flashHint(); }
      return matches.length;
    }
    function clear(keepUI) {
      view.classList.remove('is-query');
      nodes.forEach(function (n) { n.el.classList.remove('match'); });
      gMst.innerHTML = ''; drawMini();
      hint.textContent = coarse ? 'drag to explore · pinch to zoom' : 'drag to explore · ctrl + scroll to zoom · click to zoom in';
      if (!keepUI) { find.value = ''; resetChips(); }
    }
    function resetChips(except) {
      Array.prototype.forEach.call(chips.querySelectorAll('button'), function (b) { if (b !== except) b.setAttribute('aria-pressed', 'false'); });
    }
    chips.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      var on = b.getAttribute('aria-pressed') !== 'true';
      resetChips(b); b.setAttribute('aria-pressed', String(on)); find.value = '';
      if (on) query({ tag: b.dataset.tag }); else { clear(true); fitAll(); }
    });
    var findT = 0;
    find.addEventListener('input', function () {
      clearTimeout(findT);
      findT = setTimeout(function () {
        resetChips();
        var v = find.value.trim();
        if (v) query({ text: v }); else { clear(true); fitAll(); }
      }, 260);
    });
    find.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { find.value = ''; clear(true); fitAll(); }
      if (e.key === 'Enter') { var m = world.querySelector('.cn-card.match'); if (m) m.focus(); }
    });

    /* ---------- build once it can be measured; keep the centre when the box resizes ---------- */
    function build() {
      if (built || !view.offsetWidth) return;
      built = true;
      layout();
      vw = view.clientWidth; vh = view.clientHeight;
      minS = Math.min(.3, Math.min(vw / W, vh / H) * .9);
      // on a phone the whole map is too small to read, so start on the spider at a legible zoom
      if (vw < 720) { var c = nodes['#core']; fly(viewFor(c.l, c.t, c.w, c.h, .34, 0), 0); }
      else fitAll(0);
      host.classList.add('ready');
    }
    if ('ResizeObserver' in window) new ResizeObserver(function () {
      if (!built) { build(); return; }
      var nw = view.clientWidth, nh = view.clientHeight;
      if (!nw || !nh) return;
      var cx = (vw / 2 - tx) / s, cy = (vh / 2 - ty) / s;
      vw = nw; vh = nh; minS = Math.min(.3, Math.min(vw / W, vh / H) * .9);
      tx = vw / 2 - cx * s; ty = vh / 2 - cy * s; clampView(); apply();
    }).observe(view);
    var fontsReady = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
    Promise.race([fontsReady, new Promise(function (r) { setTimeout(r, 1500); })]).then(build);

    return {
      query: function (q) { find.value = ''; resetChips(); return query(q); },
      clear: function () { clear(); fitAll(); },
      refresh: build
    };
  }

  window.SiteMap = { mount: mount };
})();
