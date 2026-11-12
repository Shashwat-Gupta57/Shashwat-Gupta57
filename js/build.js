/* The build: the home page assembles itself in front of you, put together by eight cursors, each
   in its own colour. The real page is hidden (visibility only, so nothing
   moves), taken apart into layers, and put back top to bottom the way a person would build it:
   boxes are dragged out with a selection rectangle and a size label, text is typed in, effects are
   added from a right-click menu, the animated parts get their real code typed into an editor window,
   and anything repeated (stat tiles, chips, timeline entries, map cards…) is built once, copied, pasted and
   edited. Tour mode scrolls along as each screen finishes; scrolling yourself takes over. Whatever is on
   your screen is built first; anything you scrolled past, or haven't reached, is kept as a backlog
   that free cursors go back to (off screen) whenever your screen doesn't need them. Nothing is skipped.
   Every page builds itself once per browser session; the Tour button at the right of the nav
   ("Tour site" on the home page, "Tour page" elsewhere) replays it. Esc or ✕ skips. Skipped under
   reduced motion (unless asked for), with ?build=off, and of course without JavaScript.
   js/prebuild.js, in each page's <head>, decides and hides the page before first paint (html.sw-on). */
(function () {
  'use strict';

  var root = document.documentElement;
  var BASE = root.getAttribute('data-base') || '';
  var SKIP = 'script, style, noscript, template, link, meta, br, wbr, .gate, .sw-ui';
  // pieces built as one unit: wiped in, never taken apart or typed into
  var ATOMS = '.term, .hz-end, img, svg, canvas, video, pre';
  // classes that only mark state, so they don't make two otherwise identical siblings different
  var STATE = { active: 1, in: 1, on: 1, lit: 1, match: 1, launch: 1, future: 1 };
  var COLORS = ['#9b8cff', '#5b9bff', '#ff6a3d', '#3ddc84', '#ffc247', '#f472b6', '#22d3ee', '#ef4444'];
  // timings at 1×, in ms (typing in characters per second)
  var T = { flyMin: 280, flyMax: 800, drag: 560, wipe: 800, copy: 460, paste: 380, select: 280, gap: 70, cpsMin: 22, cpsMax: 80, typeFor: 1.15 };
  // the tour glides steadily: a share of the screen height per second, slower while lots on screen is unbuilt
  var GLIDE = { base: .085, busy: .28, some: .6, idle: 3, smooth: 450 };
  var HELPERS = 3;
  // Parts that run on code: a cursor right-clicks, picks "Write code…", and the part's real source is
  // typed into an editor beside it (read from the site's own scripts, so it's always the current code)
  var CODE = [
    { sel: '.term', file: 'main.js', from: '(function walker()', lines: 30 },
    { sel: '.spider-box', file: 'spider.js', from: '  function drawSpider(', lines: 30 },
    { sel: '.cn-view', file: 'constellation.js', from: '    /* ---------- the camera ---------- */', lines: 30 },
    { sel: '.cn-svg', file: 'constellation.js', from: "    // the spider's web", lines: 26 },
    { sel: '.cn-mini', file: 'constellation.js', from: '    /* ---------- minimap ---------- */', lines: 24 }
  ];
  var CODE_CPS = 1200;   // typed for the look of it, not to be read
  // simple effects are added from the right-click menu instead; shadows and loops are held back until then
  var HOVERS = '.btn, .stat, .cn-card, .tk-col, .socials a, .tour-btn, .theme-btn, .nav-links a, .orbit, .spot-compare, .mail';
  var MENU = ['Copy', 'Paste', '-', 'Add hover effect', 'Add shadow', 'Add animation', '-', 'Write code…'];
  var PICK = { hover: 'Add hover effect', shadow: 'Add shadow', animation: 'Add animation', code: 'Write code…' };   // at most this many cursors share one set of copies

  var state = null;   // the running build, or null
  var api = window.SGBuild = { running: false, pending: false, replay: replay, skip: function () { if (state) skip(); } };
  Object.defineProperty(api, 'state', { get: function () { return state; } });   // for inspecting a run from the console

  /* ---------------- taking the page apart ---------------- */
  function transparent(c) { return !c || c === 'transparent' || /rgba\([^)]*,\s*0\)$/.test(c); }
  function visual(cs, el) {
    var paints = !transparent(cs.backgroundColor) || cs.backgroundImage !== 'none' || cs.boxShadow !== 'none' ||
      ['Top', 'Right', 'Bottom', 'Left'].some(function (s) { return parseFloat(cs['border' + s + 'Width']) > 0 && !transparent(cs['border' + s + 'Color']); });
    if (!paints) return false;
    var r = el.getBoundingClientRect();
    return r.width >= 6 && r.height >= 4;
  }
  function directText(el) {
    for (var n = el.firstChild; n; n = n.nextSibling) if (n.nodeType === 3 && /\S/.test(n.nodeValue)) return true;
    return false;
  }
  function ownText(layer) {
    var out = '', w = document.createTreeWalker(layer.el, NodeFilter.SHOW_TEXT), n;
    while ((n = w.nextNode())) if (n.parentElement.__sw === layer) out += n.nodeValue;
    return out.replace(/\s+/g, ' ').trim();
  }
  // Walks nav, main and footer in document order. A layer is anything that paints (box), holds text
  // (text) or is an atom. Inline elements inside a text layer belong to it, so a paragraph with a
  // <strong> in it is typed as one sentence.
  function capture() {
    var layers = [];
    function walk(el, parent, owner) {
      if (el.matches(SKIP)) return;
      var cs = getComputedStyle(el);
      if (cs.display === 'none' || cs.visibility === 'hidden') return;   // hidden by the page itself: leave it be
      if (owner) { el.__sw = owner; for (var c = el.firstElementChild; c; c = c.nextElementSibling) walk(c, parent, owner); return; }
      var atom = el.matches(ATOMS), text = !atom && directText(el), box = !atom && visual(cs, el), layer = null;
      if (atom || text || box) {
        layer = { el: el, kind: atom ? 'atom' : text ? 'text' : 'box', drag: atom || box, parent: parent, i: layers.length };
        layers.push(layer);
        el.__sw = layer;
      }
      if (atom) return;
      for (var ch = el.firstElementChild; ch; ch = ch.nextElementSibling) {
        var inline = text && /^inline/.test(getComputedStyle(ch).display);
        walk(ch, layer || parent, inline ? layer : null);
      }
    }
    var had = root.classList.contains('sw-on');
    root.classList.remove('sw-on');   // measure the page as it really is; nothing paints inside this task
    Array.prototype.forEach.call(document.querySelectorAll('body > header, body > main, body > footer'), function (s) { walk(s, null, null); });
    if (had) root.classList.add('sw-on');
    layers.forEach(function (l) {
      if (l.kind === 'text') l.str = ownText(l);
      // every piece starts explicitly hidden: otherwise revealing a container (the nav, a card,
      // the map) would show everything inside it before anyone had built it
      l.el.setAttribute('data-sw', '0');
      var code = CODE.filter(function (c) { return l.el.matches(c.sel); })[0];
      if (code) { l.code = code; return; }
      var cs = getComputedStyle(l.el);
      l.effect = cs.animationName && cs.animationName !== 'none' ? 'animation'
        : l.el.matches(HOVERS) ? 'hover'
        : l.drag && cs.boxShadow !== 'none' && !/inset/.test(cs.boxShadow) ? 'shadow' : null;
      if (l.effect === 'animation') hold(l, 'animation-play-state', 'paused');
      if (l.effect !== 'animation' && cs.boxShadow !== 'none' && !/inset/.test(cs.boxShadow)) hold(l, 'box-shadow', 'none');
    });
    return layers;
  }

  // hold an effect back (inline !important) until a cursor adds it; release puts the page's own style back
  function hold(l, prop, val) {
    (l.held = l.held || []).push({ prop: prop, prev: l.el.style.getPropertyValue(prop), prio: l.el.style.getPropertyPriority(prop) });
    l.el.style.setProperty(prop, val, 'important');
  }
  function release(l) {
    (l.held || []).forEach(function (h) { if (h.prev) l.el.style.setProperty(h.prop, h.prev, h.prio); else l.el.style.removeProperty(h.prop); });
    l.held = null;
  }

  // Repeated siblings (same tag and classes, same inner make-up) become a group: built once, then
  // copied and pasted, then edited. Outer groups claim their insides first.
  function groups(layers) {
    var found = [], owned = new Set();
    function sig(el) { return el.tagName + '.' + Array.prototype.filter.call(el.classList, function (c) { return !STATE[c]; }).sort().join('.'); }
    function inside(el) { return layers.filter(function (l) { return !owned.has(l) && (l.el === el || el.contains(l.el)); }); }
    function shape(ls) { return ls.map(function (l) { return l.kind + (l.drag ? '+' : ''); }).join(','); }
    function scan(el) {
      var kids = Array.prototype.filter.call(el.children, function (c) { return !c.matches(SKIP); }), buckets = {};
      kids.forEach(function (c) { (buckets[sig(c)] = buckets[sig(c)] || []).push(c); });
      var claimed = new Set();
      Object.keys(buckets).forEach(function (k) {
        var members = buckets[k];
        if (members.length < 2) return;
        var items = members.map(function (m) { return { el: m, layers: inside(m) }; }).filter(function (it) { return it.layers.length; });
        if (items.length < 2) return;
        var s0 = shape(items[0].layers);
        items = items.filter(function (it) { return shape(it.layers) === s0; });
        if (items.length < 2) return;
        items.forEach(function (it) { it.layers.forEach(function (l) { owned.add(l); }); claimed.add(it.el); });
        found.push({ items: items, first: items[0].layers[0].i, parent: items[0].layers[0].parent });
      });
      kids.forEach(function (c) { if (!claimed.has(c)) scan(c); });
    }
    Array.prototype.forEach.call(document.querySelectorAll('body > header, body > main, body > footer'), scan);
    return { list: found, owned: owned };
  }

  // the work, in page order: single layers, and whole groups (one cursor sees a group through)
  function plan(layers) {
    var g = groups(layers), jobs = g.list.map(function (gr) { return { group: gr, at: gr.first, parent: gr.parent }; });
    layers.forEach(function (l) { if (!g.owned.has(l)) jobs.push({ layer: l, at: l.i, parent: l.parent }); });
    return jobs.sort(function (a, b) { return a.at - b.at; });
  }

  /* ---------------- typing into the real text nodes ---------------- */
  function textNodes(layer) {
    var list = [], w = document.createTreeWalker(layer.el, NodeFilter.SHOW_TEXT), n;
    while ((n = w.nextNode())) if (/\S/.test(n.nodeValue) && n.parentElement.__sw === layer) list.push(n);
    return list;
  }
  // Fresh text: the untyped rest of each node waits in an invisible span right after it, so the
  // line already takes its full space and nothing below shifts while it comes in.
  function prepText(layer) {
    var nodes = textNodes(layer).map(function (n) {
      var ghost = document.createElement('span');
      ghost.setAttribute('data-sw-ghost', '');
      ghost.textContent = n.nodeValue;
      n.parentNode.insertBefore(ghost, n.nextSibling);
      var t = { node: n, full: n.nodeValue, ghost: ghost, shown: 0 };
      n.nodeValue = '';
      return t;
    });
    layer.nodes = nodes; layer.total = nodes.reduce(function (s, t) { return s + t.full.length; }, 0); layer.typed = 0;
  }
  // Pasted text: the element shows the text it was copied with, which is then selected and retyped
  function prepEdit(layer, old) {
    var nodes = textNodes(layer).map(function (n) { return { node: n, full: n.nodeValue, ghost: null, shown: 0 }; });
    nodes.forEach(function (t, k) { t.node.nodeValue = k ? '' : old; });
    layer.nodes = nodes; layer.total = nodes.reduce(function (s, t) { return s + t.full.length; }, 0); layer.typed = 0;
  }
  function clearEdit(layer) { layer.nodes.forEach(function (t) { t.node.nodeValue = ''; t.shown = 0; }); }
  function typeTo(layer, count) {
    var left = count;
    layer.nodes.forEach(function (t) {
      var k = Math.max(0, Math.min(t.full.length, left));
      left -= t.full.length;
      if (k !== t.shown) { t.node.nodeValue = t.full.slice(0, k); if (t.ghost) t.ghost.textContent = t.full.slice(k); t.shown = k; }
    });
  }
  function finishText(layer) {
    if (!layer.nodes) return;
    layer.nodes.forEach(function (t) { t.node.nodeValue = t.full; if (t.ghost && t.ghost.parentNode) t.ghost.parentNode.removeChild(t.ghost); });
    layer.nodes = null;
  }
  function caretAt(layer) {
    var t = null, nodes = layer.nodes || [];
    for (var i = nodes.length - 1; i >= 0; i--) if (nodes[i].shown > 0) { t = nodes[i]; break; }
    try {
      var rg = document.createRange();
      if (t) { rg.setStart(t.node, t.shown); rg.collapse(true); }
      else if (nodes[0] && nodes[0].ghost) rg.selectNodeContents(nodes[0].ghost);
      else { rg.selectNodeContents(layer.el); rg.collapse(true); }
      var rs = rg.getClientRects(), r = rs[rs.length - 1] || rg.getBoundingClientRect();
      if (r && (r.height || r.width)) return { x: t ? r.right : r.left, y: r.top, h: r.height || 16 };
    } catch (e) { /* fall through */ }
    var b = layer.el.getBoundingClientRect();
    return { x: b.left, y: b.top, h: Math.min(b.height, 20) || 16 };
  }

  /* ---------------- revealing ---------------- */
  function reveal(layer, how) {
    layer.el.setAttribute('data-sw', '1');
    var d = (how === 'wipe' ? T.wipe : 380) / state.speed;
    if (how === 'wipe') layer.el.animate([{ clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0 0 0)' }], { duration: d, easing: 'cubic-bezier(.16,1,.3,1)' });
    else if (how === 'pop') layer.el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: d, easing: 'ease-out' });
  }
  function done(layer) { if (!layer.done) { layer.done = true; state.built++; } }
  function instant(layer) { finishText(layer); release(layer); reveal(layer); done(layer); }

  /* ---------------- sound: tiny clicks made in the browser, off until asked for ---------------- */
  var ac = null, lastTick = 0;
  function blip(freq, len, vol, type) {
    if (!state || !state.sound || !ac) return;
    var o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime;
    o.type = type || 'sine'; o.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.0001, t + len);
    o.connect(g); g.connect(ac.destination); o.start(t); o.stop(t + len);
  }
  function tick() { var n = performance.now(); if (n - lastTick < 60) return; lastTick = n; blip(1500 + Math.random() * 900, .025, .018, 'square'); }
  function pop() { blip(620 + Math.random() * 180, .09, .05); }

  /* ---------------- the agents ---------------- */
  function lum(hex) {
    var m = /^#?([0-9a-f]{6})$/i.exec(hex || ''); if (!m) return .5;
    var v = parseInt(m[1], 16);
    return (.2126 * (v >> 16 & 255) + .7152 * (v >> 8 & 255) + .0722 * (v & 255)) / 255;
  }
  function makeAgents() {
    var cx = innerWidth / 2, cy = innerHeight / 2;
    return COLORS.map(function (c, i) {
      var a = i / COLORS.length * Math.PI * 2, r = 74 + (i % 2) * 30;
      return { color: c, ink: lum(c) > .62 ? '#0c0c0e' : '#fff', x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r,
               ang: a, rad: r, job: null, steps: [], task: null, seed: Math.random() * 1000, side: i % 2 ? 1 : -1 };
    });
  }
  function rectOf(el) { return el.getBoundingClientRect(); }
  function ease(k) { return 1 - Math.pow(1 - k, 3); }
  // where something is relative to the screen: 'here', 'above' (scrolled past), 'below' (below or to
  // the right, not reached yet), or 'void' (no size, or a backdrop bigger than the screen: just shown)
  function where(el) {
    var r = rectOf(el), W = innerWidth, H = innerHeight;
    if (!r.width || !r.height || r.height > H * 1.2 || r.width * r.height > W * H * 1.3) return 'void';
    if (r.bottom < 0 || r.right < 0) return 'above';
    if (r.top > H * .95 || r.left > W * .97) return 'below';
    return 'here';
  }
  // how far off screen a piece is, for picking the nearest backlog first
  function distance(el) {
    var r = rectOf(el), H = innerHeight, W = innerWidth;
    return Math.max(0, -r.bottom, r.top - H) + Math.max(0, -r.right, r.left - W);
  }
  function atEnd() { return scrollY >= document.documentElement.scrollHeight - innerHeight - 2; }
  function jobEl(J) { return J.layer ? J.layer.el : J.group.items[0].el; }

  // turn a job into the steps one cursor will carry out
  function stepsFor(job) {
    if (job.layer) return [{ do: 'layer', layer: job.layer }];
    var gr = job.group, items = gr.items, steps = [];
    gr.queue = items.slice(1); gr.helpers = 1;
    items[0].layers.forEach(function (l) { steps.push({ do: 'layer', layer: l, item: items[0] }); });
    steps.push({ do: 'copy', item: items[0], group: gr });
    return steps;
  }
  // after the copy, each cursor on the set takes the next slot: paste it, then edit what differs
  function pasteSteps(gr) {
    var it = gr.queue.shift(), src = gr.items[0], steps = [{ do: 'paste', item: it, src: src }];
    it.layers.forEach(function (l, k) { if (l.kind === 'text') steps.push({ do: 'edit', layer: l, old: src.layers[k].str, item: it }); });
    return steps;
  }

  // Start the next step. Backdrops just appear. Off-screen steps are worked on off screen (that's the
  // backlog), except that while touring, things below simply wait for the tour to bring them in.
  // Between items of a copied set, a cursor working off screen hands the rest back if your screen
  // has work waiting, and the set stays in the backlog for whoever is free next.
  function next(ag, now) {
    while (ag.steps.length) {
      var st = ag.steps[0], el = st.do === 'paste' || st.do === 'copy' ? st.item.el : st.layer.el;
      if ((st.do === 'layer' || st.do === 'edit') && st.layer.done) { ag.steps.shift(); continue; }
      if (st.do === 'effect' && !st.layer.held && st.layer.effect !== 'hover') { ag.steps.shift(); continue; }
      var w = where(el);
      if (w === 'void') {
        ag.steps.shift();
        if (st.do === 'layer') instant(st.layer);
        else if (st.do === 'paste') { st.item.layers.forEach(instant); ag.steps = ag.steps.filter(function (x) { return x.item !== st.item; }); }
        else if (st.do === 'edit') { finishText(st.layer); done(st.layer); }
        else if (st.do === 'copy') { st.group.copied = true; state.sets.push(st.group); }
        else if (st.do === 'effect') release(st.layer);
        continue;
      }
      if (w === 'below' && state.tour && !atEnd()) { ag.waiting = true; return; }
      if (w !== 'here' && st.do === 'paste' && state.hereWaiting) {
        ag.job.group.queue.unshift(st.item); ag.steps = []; break;   // back to your screen; the set waits
      }
      ag.waiting = false;
      ag.steps.shift();
      var r = rectOf(el), to = { x: r.left, y: r.top };
      if (st.do === 'layer' && st.layer.kind === 'text' && !st.layer.drag) { prepText(st.layer); var c = caretAt(st.layer); to = { x: c.x, y: c.y }; }
      if (st.do === 'copy') to = { x: r.left + r.width * .5, y: r.top + Math.min(r.height * .5, 40) };
      if (st.do === 'edit') { var cc = caretAt(st.layer); to = { x: cc.x, y: cc.y }; }
      if (st.do === 'effect') to = { x: r.left + Math.min(r.width * .55, 140), y: r.top + Math.min(r.height * .5, 24) };
      var d = Math.hypot(to.x - ag.x, to.y - ag.y);
      ag.task = { st: st, phase: 'fly', t0: now + T.gap / state.speed, dur: Math.min(T.flyMax, Math.max(T.flyMin, d / .9)) / state.speed, from: { x: ag.x, y: ag.y }, to: to };
      return;
    }
    var gr = ag.job && ag.job.group;
    if (gr && gr.copied && gr.queue.length && !(state.hereWaiting && where(gr.queue[0].el) !== 'here')) { ag.steps = pasteSteps(gr); next(ag, now); return; }
    if (gr) gr.helpers--;
    ag.job = null; ag.waiting = false;
  }

  function cps(total) { return Math.min(T.cpsMax, Math.max(T.cpsMin, total / T.typeFor)) * state.speed; }

  // one frame of an agent's current step
  function work(ag, now) {
    var tk = ag.task, st = tk.st, L = st.layer, k = Math.max(0, Math.min(1, (now - tk.t0) / tk.dur));
    if (tk.phase === 'fly') {
      var e = ease(k), mx = (tk.from.x + tk.to.x) / 2, my = (tk.from.y + tk.to.y) / 2;
      var dx = tk.to.x - tk.from.x, dy = tk.to.y - tk.from.y, cxp = mx - dy * .18 * ag.side, cyp = my + dx * .18 * ag.side;
      ag.x = (1 - e) * (1 - e) * tk.from.x + 2 * (1 - e) * e * cxp + e * e * tk.to.x;
      ag.y = (1 - e) * (1 - e) * tk.from.y + 2 * (1 - e) * e * cyp + e * e * tk.to.y;
      if (k < 1) return;
      tk.t0 = now;
      if (st.do === 'copy') { tk.phase = 'copy'; tk.dur = T.copy / state.speed; return; }
      if (st.do === 'paste') { tk.phase = 'paste'; tk.dur = T.paste / state.speed; paste(st); pop(); return; }
      if (st.do === 'edit') { tk.phase = 'select'; tk.dur = T.select / state.speed; return; }
      if (st.do === 'effect') { openMenu(ag, tk, PICK[L.effect]); return; }
      if (L.drag) { tk.phase = 'drag'; tk.dur = (L.kind === 'atom' ? T.drag * 1.2 : T.drag) / state.speed; }
      else { tk.phase = 'type'; reveal(L); }
      return;
    }
    if (tk.phase === 'drag') {
      var r = rectOf(L.el), g = ease(k);
      tk.box = { x: r.left, y: r.top, w: r.width * g, h: r.height * g };
      ag.x = r.left + r.width * g; ag.y = r.top + r.height * g;
      if (k < 1) return;
      state.fading.push({ x: r.left, y: r.top, w: r.width, h: r.height, color: ag.color, ink: ag.ink, born: now });
      tk.box = null; pop();
      if (L.kind === 'text') { prepText(L); reveal(L, 'pop'); tk.phase = 'type'; tk.t0 = now; return; }
      if (L.code && L.code.text) { openMenu(ag, tk, PICK.code); return; }
      reveal(L, L.kind === 'atom' ? 'wipe' : 'pop');
      built(ag, L);
      return;
    }
    if (tk.phase === 'menu') {
      // the cursor slides down the menu to its option, then clicks it
      var m = tk.menu, mk = Math.max(0, Math.min(1, (k - .3) / .5)), me = ease(mk);
      ag.x = m.x + (m.ox - m.x) * me; ag.y = m.y + (m.oy - m.y) * me;
      if (mk > 0) m.item.classList.add('on');
      if (k < 1) return;
      m.el.remove(); tk.menu = null; tk.t0 = now;
      if (st.do !== 'effect' && L.code) { openCode(ag, tk, L); return; }
      release(L);
      state.flashes.push({ el: L.el, color: ag.color, ink: ag.ink, label: '✓ ' + (L.effect === 'hover' ? 'hover effect' : L.effect) + ' added', born: now });
      tk.phase = 'applied'; tk.dur = 420 / state.speed;
      return;
    }
    if (tk.phase === 'applied') { if (k >= 1) ag.task = null; return; }
    if (tk.phase === 'code') {
      // open, type the source at a blur, press Run, close, and the part comes alive
      var cw = tk.code, n = Math.min(cw.len, Math.floor((now - tk.t0 - 180 / state.speed) / 1000 * CODE_CPS * state.speed));
      if (n > cw.shown) { cw.shown = n; cw.pre.innerHTML = codeHTML(cw.toks, n) + '<i class="sw-caret"></i>'; cw.pre.scrollTop = cw.pre.scrollHeight; tick(); }
      var b = cw.pre.getBoundingClientRect(); ag.x = b.left + 24; ag.y = b.bottom - 14;
      if (n < cw.len) return;
      if (!cw.ran) { cw.ran = now; cw.run.classList.add('on'); pop(); return; }
      if (now - cw.ran < 340 / state.speed) return;
      cw.el.classList.add('sw-closing');
      setTimeout(function () { cw.el.remove(); }, 260);
      reveal(L, L.kind === 'atom' ? 'wipe' : 'pop');
      built(ag, L);
      return;
    }
    if (tk.phase === 'copy' || tk.phase === 'paste') {
      if (k >= 1) { if (st.group) { st.group.copied = true; state.sets.push(st.group); } ag.task = null; }
      return;
    }
    if (tk.phase === 'select') {
      if (k < 1) return;
      clearEdit(L); tk.phase = 'type'; tk.t0 = now;
      return;
    }
    if (tk.phase === 'type') {
      var want = Math.min(L.total, Math.floor((now - tk.t0) / 1000 * cps(L.total)));
      if (want > L.typed) { typeTo(L, want); L.typed = want; tick(); }
      var c = caretAt(L);
      tk.caret = c; ag.x = c.x + 3; ag.y = c.y + c.h * .55;
      if (L.typed < L.total) return;
      finishText(L); built(ag, L);
    }
  }

  // a piece is finished; if it has an effect to add, its cursor does that next
  function built(ag, L) {
    done(L); ag.task = null;
    if (L.effect && L.wantsEffect !== false) ag.steps.unshift({ do: 'effect', layer: L });
  }
  // right-click: a context menu opens at the cursor with the option to pick highlighted on the way down
  function openMenu(ag, tk, pick) {
    var el = document.createElement('div');
    el.className = 'sw-menu sw-ui'; el.setAttribute('aria-hidden', 'true');
    el.innerHTML = MENU.map(function (o) { return o === '-' ? '<hr>' : '<span>' + o + '</span>'; }).join('');
    document.body.appendChild(el);
    var x = Math.min(ag.x + 4, innerWidth - el.offsetWidth - 8), y = Math.min(ag.y + 4, innerHeight - el.offsetHeight - 8);
    el.style.left = x + 'px'; el.style.top = y + 'px';
    var item = Array.prototype.filter.call(el.children, function (c) { return c.textContent === pick; })[0], r = item.getBoundingClientRect();
    tk.menu = { el: el, item: item, x: ag.x, y: ag.y, ox: r.left + 18, oy: r.top + r.height / 2 };
    tk.phase = 'menu'; tk.dur = 900 / state.speed; tk.rclick = performance.now();
    pop();
  }
  // the editor window: beside the part where there's room, typing the part's real code
  function openCode(ag, tk, L) {
    var c = L.code, el = document.createElement('div');
    el.className = 'sw-code sw-ui'; el.setAttribute('aria-hidden', 'true');
    el.innerHTML = '<div class="sw-code-bar"><span class="dots"><i></i><i></i><i></i></span><b>' + c.file + '</b><span class="sw-run">▶ Run</span></div><pre></pre>';
    el.style.setProperty('--c', ag.color);
    document.body.appendChild(el);
    var r = rectOf(L.el), w = el.offsetWidth, h = el.offsetHeight;
    var x = r.right + 16 + w < innerWidth ? r.right + 16 : r.left - 16 - w > 0 ? r.left - 16 - w : Math.max(8, Math.min(innerWidth - w - 8, r.left + 24));
    var y = Math.max(72, Math.min(innerHeight - h - 90, r.top));
    el.style.left = x + 'px'; el.style.top = y + 'px';
    var toks = tokens(c.text);
    tk.code = { el: el, pre: el.querySelector('pre'), run: el.querySelector('.sw-run'), toks: toks, len: c.text.length, shown: 0 };
    tk.phase = 'code'; tk.t0 = performance.now();
  }

  // Ctrl+V: the copy lands in its slot showing the text it was copied with, ready to be edited
  function paste(st) {
    var it = st.item;
    it.layers.forEach(function (l, k) {
      if (l.kind === 'text') { prepEdit(l, st.src.layers[k].str); l.el.setAttribute('data-sw', '1'); if (l.str === st.src.layers[k].str) { finishText(l); done(l); } }
      else { l.el.setAttribute('data-sw', '1'); done(l); }
      release(l);
    });
    // drop in from a little up and left, like a paste landing
    it.el.animate([{ opacity: .35, translate: '-10px -10px' }, { opacity: 1, translate: '0 0' }], { duration: T.paste / state.speed, easing: 'cubic-bezier(.16,1,.3,1)' });
  }

  /* ---------------- drawing: cursors, selection boxes, size labels, carets ---------------- */
  var MONO = '600 11px "JetBrains Mono", ui-monospace, monospace';
  function roundRect(x, y, w, h, r) { var c = state.ctx; c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
  function pill(text, x, y, bg, ink, font) {
    var c = state.ctx; c.font = font; var w = c.measureText(text).width + 12;
    roundRect(x, y, w, 18, 4); c.fillStyle = bg; c.fill();
    c.fillStyle = ink; c.textBaseline = 'middle'; c.fillText(text, x + 6, y + 9.5);
    return w;
  }
  function selection(b, color, ink, alpha, label) {
    var c = state.ctx; c.globalAlpha = alpha * .07;
    c.fillStyle = color; c.fillRect(b.x, b.y, b.w, b.h); c.globalAlpha = alpha;
    c.strokeStyle = color; c.lineWidth = 1.5; c.strokeRect(b.x + .5, b.y + .5, b.w, b.h);
    [[b.x, b.y], [b.x + b.w, b.y], [b.x, b.y + b.h], [b.x + b.w, b.y + b.h]].forEach(function (p) {
      c.fillStyle = '#fff'; c.fillRect(p[0] - 3, p[1] - 3, 7, 7); c.strokeStyle = color; c.lineWidth = 1.2; c.strokeRect(p[0] - 3, p[1] - 3, 7, 7);
    });
    if (label) pill(Math.round(b.w) + ' × ' + Math.round(b.h), b.x + b.w / 2 - 30, b.y + b.h + 7, color, ink, MONO);
    c.globalAlpha = 1;
  }
  function arrow(ag) {
    var c = state.ctx; c.save(); c.translate(ag.x, ag.y);
    c.shadowColor = 'rgba(0,0,0,.45)'; c.shadowBlur = 6; c.shadowOffsetY = 2;
    c.beginPath(); c.moveTo(0, 0); c.lineTo(15, 6); c.lineTo(7.5, 8); c.lineTo(5.5, 15.5); c.closePath();
    c.fillStyle = ag.color; c.fill(); c.shadowColor = 'transparent';
    c.strokeStyle = '#fff'; c.lineWidth = 1.6; c.lineJoin = 'round'; c.stroke();
    c.restore();
  }
  function ibeam(ag) {
    var c = state.ctx, x = ag.x + 6, y = ag.y - 2;
    c.strokeStyle = '#fff'; c.lineWidth = 3.4; c.lineCap = 'round';
    c.beginPath(); c.moveTo(x, y - 8); c.lineTo(x, y + 8); c.moveTo(x - 4, y - 9); c.lineTo(x + 4, y - 9); c.moveTo(x - 4, y + 9); c.lineTo(x + 4, y + 9); c.stroke();
    c.strokeStyle = ag.color; c.lineWidth = 1.6; c.stroke();
  }
  function draw(now) {
    var c = state.ctx;
    c.clearRect(0, 0, innerWidth, innerHeight);
    state.fading = state.fading.filter(function (f) {
      var a = 1 - (now - f.born) / (520 / state.speed);
      if (a <= 0) return false;
      selection(f, f.color, f.ink, a * .9, true);
      return true;
    });
    state.flashes = state.flashes.filter(function (f) {
      var a = 1 - (now - f.born) / (900 / state.speed);
      if (a <= 0) return false;
      var r = rectOf(f.el), grow = (1 - a) * 6;
      c.globalAlpha = a; c.strokeStyle = f.color; c.lineWidth = 2;
      roundRect(r.left - 4 - grow, r.top - 4 - grow, r.width + 8 + grow * 2, r.height + 8 + grow * 2, 10); c.stroke();
      pill(f.label, r.left, r.top - 26, f.color, f.ink, MONO);
      c.globalAlpha = 1;
      return true;
    });
    state.agents.forEach(function (ag) {
      var tk = ag.task; if (!tk) return;
      if (tk.rclick && now - tk.rclick < 380) {
        var q = (now - tk.rclick) / 380;
        c.globalAlpha = 1 - q; c.strokeStyle = ag.color; c.lineWidth = 2;
        c.beginPath(); c.arc(tk.menu ? tk.menu.x : ag.x, tk.menu ? tk.menu.y : ag.y, 4 + q * 14, 0, 7); c.stroke(); c.globalAlpha = 1;
      }
      var ph = tk.phase, el = tk.st.layer ? tk.st.layer.el : tk.st.item.el;
      if (tk.box) selection(tk.box, ag.color, ag.ink, 1, true);
      if (ph === 'copy' || ph === 'paste') {
        var r = rectOf(el), k = Math.min(1, (now - tk.t0) / tk.dur);
        selection({ x: r.left, y: r.top, w: r.width, h: r.height }, ag.color, ag.ink, ph === 'copy' ? 1 : 1 - k * .6, ph === 'paste');
        if (ph === 'copy') { c.globalAlpha = .1 + .12 * Math.sin(k * Math.PI); c.fillStyle = ag.color; c.fillRect(r.left, r.top, r.width, r.height); c.globalAlpha = 1; }
      }
      if (ph === 'select') {
        var rs = el.getClientRects(); c.fillStyle = 'rgba(77,141,255,.38)';
        Array.prototype.forEach.call(el.getClientRects(), function (q) { c.fillRect(q.left, q.top, q.width * Math.min(1, (now - tk.t0) / (tk.dur * .7)), q.height); });
        if (!rs.length) { var b = rectOf(el); c.fillRect(b.left, b.top, b.width, b.height); }
      }
      if (ph === 'type' && tk.caret) {
        var t = rectOf(el);
        selection({ x: t.left - 3, y: t.top - 2, w: t.width + 6, h: t.height + 4 }, ag.color, ag.ink, .55, false);
        if ((now / 420 | 0) % 2 === 0) { c.fillStyle = ag.color; c.fillRect(tk.caret.x, tk.caret.y, 2, tk.caret.h); }
      }
    });
    state.agents.forEach(function (ag) {
      c.globalAlpha = ag.alpha == null ? 1 : ag.alpha;
      var tk = ag.task, ph = tk && tk.phase;
      if (ph === 'type') ibeam(ag); else arrow(ag);
      if (ph === 'copy' || ph === 'paste') pill(ph === 'copy' ? 'Ctrl+C' : 'Ctrl+V', ag.x + 14, ag.y + 16, '#fff', '#0c0c0e', MONO);
      if (ph === 'select') pill('Ctrl+A', ag.x + 14, ag.y + 16, '#fff', '#0c0c0e', MONO);
      if (ph === 'menu' && now - tk.rclick < 500) pill('Right-click', ag.x + 14, ag.y + 16, '#fff', '#0c0c0e', MONO);
      c.globalAlpha = 1;
    });
  }

  /* ---------------- the HUD ---------------- */
  function hudHTML(agents, total) {
    return '<span class="sw-avs" aria-hidden="true">' + agents.map(function (a) { return '<i style="background:' + a.color + '"></i>'; }).join('') + '</span>' +
      '<span class="sw-msg"><b>' + agents.length + '</b> agents</span>' +
      '<span class="sw-sep" aria-hidden="true"></span>' +
      '<span class="sw-layers"><b data-sw-built>0</b> / ' + total + ' layers</span>' +
      '<span class="sw-bar" aria-hidden="true"><i></i></span>' +
      '<button type="button" data-a="tour" aria-pressed="true">Touring</button>' +
      '<button type="button" data-a="speed" aria-label="Build speed">1×</button>' +
      '<button type="button" data-a="sound" aria-pressed="false"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4z"/><path class="sw-wave" d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12"/></svg><span>Tap for sound</span></button>' +
      '<button type="button" data-a="skip" aria-label="Skip the build (Esc)">✕</button>';
  }
  function setTour(on) {
    state.tour = on; state.sy = null; state.v = 0;
    var b = state.hud.querySelector('[data-a="tour"]');
    if (b) b.setAttribute('aria-pressed', String(on));
  }

  // give a job to the free cursor nearest to it
  function take(J, free) {
    var r = rectOf(jobEl(J)), best = 0, bd = Infinity;
    free.forEach(function (a, j) { var d = Math.hypot(a.x - r.left, a.y - r.top); if (d < bd) { bd = d; best = j; } });
    var ag = free.splice(best, 1)[0];
    J.taken = true; ag.job = J; ag.steps = stepsFor(J);
  }
  // a free cursor joins a set that's already been copied, and takes its next slot
  function join(g, free) {
    var r0 = rectOf(g.queue[0].el), bi = 0, bd = Infinity;
    free.forEach(function (a, j) { var d = Math.hypot(a.x - r0.left, a.y - r0.top); if (d < bd) { bd = d; bi = j; } });
    var helper = free.splice(bi, 1)[0];
    helper.job = { group: g }; helper.steps = pasteSteps(g); g.helpers++;
  }

  /* ---------------- the loop ---------------- */
  function frame(now) {
    if (!state) return;
    state.raf = requestAnimationFrame(frame);
    var W = innerWidth, H = innerHeight, dt = now - (state.last || now); state.last = now;

    if (state.phase === 'scan') {
      // the crew circles the monogram while the page is "scanned"
      var k = Math.min(1, (now - state.t0) / (1800 / state.speed));
      state.agents.forEach(function (ag) {
        ag.ang += dt * .0018 * (ag.side > 0 ? 1 : 1.2);
        ag.x = W / 2 + Math.cos(ag.ang) * ag.rad * (1 + .08 * Math.sin(now / 300 + ag.seed));
        ag.y = H / 2 + Math.sin(ag.ang) * ag.rad * .8;
        ag.alpha = Math.min(1, k * 3);
      });
      state.barI.style.width = (k * 100) + '%';
      if (k >= 1) {
        state.phase = 'build'; state.tStart = now;
        state.tile.classList.add('sw-out');
        state.msg.innerHTML = '<b>' + state.agents.length + '</b> agents';
      }
      draw(now);
      return;
    }

    if (state.phase === 'build') {
      // 1. your screen: hand out ready on-screen work in page order (backdrops just appear)
      var free = state.agents.filter(function (a) { return !a.job; }), inView = false, backlog = [], pending = 0;
      state.sets = state.sets.filter(function (g) { return g.queue.length; });
      for (var i = state.head; i < state.jobs.length; i++) {
        var J = state.jobs[i];
        if (J.taken) { if (i === state.head) state.head++; continue; }
        var w = where(jobEl(J));
        if (w === 'here') pending++;   // everything still to build on screen, ready or not, sets the tour's pace
        if (J.parent && !J.parent.done) continue;
        if (w === 'void' && J.layer) { J.taken = true; instant(J.layer); continue; }
        if (w !== 'here' && w !== 'void') { backlog.push(J); continue; }
        inView = true;
        if (free.length) take(J, free);
      }
      state.sets.forEach(function (g) {
        while (free.length && g.queue.length && g.helpers < HELPERS && where(g.queue[0].el) === 'here') join(g, free);
      });
      state.hereWaiting = inView && !free.length;
      // 2. the backlog: when your screen has nothing waiting, free cursors go back for unfinished work,
      //    nearest first. While touring, the tour brings in what's below, so only what's above counts
      //    (pieces the glide carried past before they were finished).
      if (free.length && !inView) {
        backlog = backlog.filter(function (J) { return !state.tour || atEnd() || where(jobEl(J)) === 'above'; })
          .sort(function (a, b) { return distance(jobEl(a)) - distance(jobEl(b)); });
        while (free.length && backlog.length) take(backlog.shift(), free);
        state.sets.slice().sort(function (a, b) { return distance(a.queue[0].el) - distance(b.queue[0].el); }).forEach(function (g) {
          while (free.length && g.queue.length && g.helpers < HELPERS) join(g, free);
        });
      }
      var busy = false, busyHere = 0;
      state.agents.forEach(function (a) {
        if (a.job && !a.task) next(a, now);
        if (a.task) { if (now >= a.task.t0 || a.task.phase !== 'fly') work(a, now); busy = true; if (a.y > 0 && a.y < H) busyHere++; }
        else { a.x += Math.sin(now / 700 + a.seed) * .25; a.y += Math.cos(now / 900 + a.seed) * .25; }
      });

      // tour: a steady glide down the page while the cursors build. It eases off while a lot on screen
      // is still unbuilt, keeps a gentle pace otherwise, and speeds up across stretches with nothing to do.
      if (state.tour) {
        var max = document.documentElement.scrollHeight - H;
        var pace = pending > 8 ? GLIDE.busy : pending > 3 ? GLIDE.some : pending === 0 && !busyHere ? GLIDE.idle : 1;
        var want = GLIDE.base * H * pace * state.speed;
        state.v = (state.v || 0) + (want - (state.v || 0)) * Math.min(1, dt / GLIDE.smooth);
        if (state.sy == null || Math.abs(scrollY - state.sy) > 3) state.sy = scrollY;   // re-sync if anything else moved the page
        if (state.sy < max) {
          state.sy = Math.min(max, state.sy + state.v * dt / 1000);
          window.scrollTo({ top: state.sy, behavior: 'instant' });
        }
      }
      state.builtEl.textContent = state.built;
      state.barI.style.width = (state.built / state.layers.length * 100) + '%';
      if (state.built >= state.layers.length && !busy) finish(now);
      draw(now);
      return;
    }

    if (state.phase === 'outro') {
      var ok = Math.min(1, (now - state.t0) / 700);
      state.agents.forEach(function (a) { a.alpha = 1 - ok; a.y -= dt * .12; });
      draw(now);
      if (ok >= 1) teardown(false);
    }
  }

  function finish(now) {
    state.phase = 'outro'; state.t0 = now;
    var secs = ((now - state.tStart) / 1000 * state.speed).toFixed(1);
    state.hud.classList.add('sw-done');
    state.hud.innerHTML = '<span class="sw-msg">Built by <b>' + state.agents.length + '</b> agents in <b>' + secs + 's</b></span>' +
      '<button type="button" data-a="replay">↻ Replay</button><button type="button" data-a="close" aria-label="Close">✕</button>';
    var hud = state.hud;
    setTimeout(function () { hud.classList.add('sw-gone'); setTimeout(function () { hud.remove(); }, 600); }, 6000);
  }

  // undo everything the build touched, leaving the page exactly as it was
  function teardown(removeHud) {
    if (!state) return;
    cancelAnimationFrame(state.raf);
    state.layers.forEach(function (l) { finishText(l); release(l); l.el.removeAttribute('data-sw'); delete l.el.__sw; });
    Array.prototype.forEach.call(document.querySelectorAll('.sw-menu, .sw-code'), function (m) { m.remove(); });
    Array.prototype.forEach.call(document.querySelectorAll('[data-sw-ghost]'), function (g) { g.remove(); });
    root.classList.remove('sw-on');
    state.canvas.remove(); state.tile.remove();
    if (removeHud) state.hud.remove();
    document.removeEventListener('keydown', state.onKey);
    ['wheel', 'touchstart'].forEach(function (ev) { window.removeEventListener(ev, state.onUser); });
    window.dispatchEvent(new Event('scroll'));   // let the timeline settle where the page now is
    state = null; api.running = false;
    if (/[?&](tour|build=1)\b/.test(location.search)) history.replaceState(null, '', location.pathname + location.hash);
  }
  function skip() {
    if (!state) return;
    state.layers.forEach(function (l) { if (!l.done) instant(l); });
    teardown(true);
  }

  // fetch each code part's source once (the scripts are already cached) and keep its excerpt
  function loadCode() {
    var cache = {};
    CODE.forEach(function (c) {
      var tag = document.querySelector('script[src*="' + c.file + '"]');
      if (!tag) return;
      (cache[c.file] = cache[c.file] || fetch(tag.src).then(function (r) { return r.text(); })).then(function (t) {
        var i = t.indexOf(c.from);
        if (i >= 0) c.text = t.slice(i).split('\n').slice(0, c.lines).join('\n');
      }).catch(function () {});
    });
  }
  // a tiny highlighter: enough to colour comments, strings, keywords, numbers and calls
  var TOK = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|('(?:\\.|[^'\\\n])*'|"(?:\\.|[^"\\\n])*")|\b(function|var|return|if|else|for|while|new|this|true|false|null|typeof)\b|(\b\d+(?:\.\d+)?\b)|([A-Za-z_$][\w$]*)(?=\()/g;
  function tokens(src) {
    var out = [], last = 0, m;
    TOK.lastIndex = 0;
    while ((m = TOK.exec(src))) {
      if (m.index > last) out.push({ t: src.slice(last, m.index) });
      out.push({ t: m[0], c: m[1] ? 'cm' : m[2] ? 'st' : m[3] ? 'kw' : m[4] ? 'nu' : 'fn' });
      last = m.index + m[0].length;
    }
    if (last < src.length) out.push({ t: src.slice(last) });
    return out;
  }
  function esc(t) { return t.replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
  function codeHTML(toks, n) {
    var html = '', left = n;
    for (var i = 0; i < toks.length && left > 0; i++) {
      var piece = toks[i].t.slice(0, left); left -= piece.length;
      html += toks[i].c ? '<span class="' + toks[i].c + '">' + esc(piece) + '</span>' : esc(piece);
    }
    return html;
  }

  // the page's own entrance effects would fight the build: settle them first
  function settle() {
    Array.prototype.forEach.call(document.querySelectorAll('[data-reveal]'), function (el) { el.classList.add('in'); });
    Array.prototype.forEach.call(document.querySelectorAll('.decrypt'), function (el) {
      if (el.dataset.text) el.textContent = el.dataset.text;
      el.dataset.done = '1';
    });
    Array.prototype.forEach.call(document.querySelectorAll('[data-count]'), function (el) {
      var n = el.dataset.count === 'projects' ? (window.PROJECTS || []).length : +el.dataset.count;
      el.textContent = n.toLocaleString('en-US') + (el.dataset.suffix || '');
      el.dataset.done = '1';
    });
  }

  /* ---------------- start ---------------- */
  function start() {
    if (state) return;
    api.pending = false;
    root.classList.add('sw-on');
    try { sessionStorage.setItem('sg-built:' + location.pathname.replace(/index\.html$/, ''), '1'); } catch (e) {}
    settle();
    loadCode();
    // the map always starts from its default overview, so a build is the same size every time
    Array.prototype.forEach.call(document.querySelectorAll('[data-constellation]'), function (h) { if (h.__map) h.__map.reset(); });
    var layers, jobs;
    try { layers = capture(); jobs = plan(layers); } catch (e) { root.classList.remove('sw-on'); return; }
    if (!layers.length) { root.classList.remove('sw-on'); return; }

    var canvas = document.createElement('canvas'); canvas.className = 'sw-canvas sw-ui'; canvas.setAttribute('aria-hidden', 'true');
    var tile = document.createElement('div'); tile.className = 'sw-tile sw-ui'; tile.setAttribute('aria-hidden', 'true'); tile.textContent = 'SG';
    var hud = document.createElement('div'); hud.className = 'sw-hud sw-ui'; hud.setAttribute('role', 'status');
    document.body.appendChild(canvas); document.body.appendChild(tile); document.body.appendChild(hud);
    var agents = makeAgents();
    hud.innerHTML = hudHTML(agents, layers.length);

    state = { layers: layers, jobs: jobs, agents: agents, canvas: canvas, ctx: canvas.getContext('2d'), tile: tile, hud: hud, fading: [],
              built: 0, head: 0, sets: [], flashes: [], speed: 1, tour: true, sound: false, phase: 'scan', t0: performance.now() };
    state.msg = hud.querySelector('.sw-msg'); state.msg.innerHTML = 'Scanning page…';
    state.builtEl = hud.querySelector('[data-sw-built]'); state.barI = hud.querySelector('.sw-bar i');
    api.running = true;

    function size() {
      var d = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = innerWidth * d; canvas.height = innerHeight * d;
      if (state) state.ctx.setTransform(d, 0, 0, d, 0, 0);
    }
    size(); window.addEventListener('resize', function () { if (state && state.canvas === canvas) size(); });

    hud.addEventListener('click', function (e) {
      var b = e.target.closest('button');
      if (!b) return;
      var a = b.dataset.a;
      if (a === 'replay') { replay(); return; }
      if (a === 'close') { hud.remove(); return; }
      if (!state) return;
      if (a === 'tour') setTour(!state.tour);
      else if (a === 'speed') { state.speed = state.speed >= 4 ? 1 : state.speed * 2; b.textContent = state.speed + '×'; }
      else if (a === 'sound') {
        state.sound = !state.sound; b.setAttribute('aria-pressed', String(state.sound));
        if (state.sound && !ac) { try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch (x) {} }
        if (ac && ac.state === 'suspended') ac.resume();
        b.querySelector('span').textContent = state.sound ? 'Sound on' : 'Tap for sound';
      }
      else if (a === 'skip') skip();
    });
    // the visitor's own scrolling always wins over the tour
    state.onUser = function () { if (state && state.tour && state.phase === 'build') setTour(false); };
    window.addEventListener('wheel', state.onUser, { passive: true });
    window.addEventListener('touchstart', state.onUser, { passive: true });
    state.onKey = function (e) {
      if (!state) return;
      if (e.key === 'Escape') { skip(); return; }
      if (/^(ArrowDown|ArrowUp|PageDown|PageUp|Home|End| )$/.test(e.key) && state.tour) setTour(false);
    };
    document.addEventListener('keydown', state.onKey);
    state.raf = requestAnimationFrame(frame);
  }

  function replay() {
    if (state) return;
    Array.prototype.forEach.call(document.querySelectorAll('.sw-hud'), function (h) { h.remove(); });
    window.scrollTo({ top: 0, behavior: 'instant' });
    requestAnimationFrame(function () { requestAnimationFrame(start); });
  }

  // the Tour button in the nav replays this page's build (without JavaScript it's a plain ?tour link)
  Array.prototype.forEach.call(document.querySelectorAll('[data-tour]'), function (a) {
    a.addEventListener('click', function (e) { e.preventDefault(); replay(); });
  });

  // Boot only if the head script decided this visit gets the build. Wait for fonts (so text is
  // measured in the right typeface), a visible tab, and the privacy note to be signed.
  if (!root.classList.contains('sw-on')) return;
  api.pending = true;
  function boot() {
    if (document.querySelector('.gate')) { document.addEventListener('sg:gate-closed', function () { setTimeout(start, 500); }, { once: true }); return; }
    if (document.visibilityState !== 'visible') {
      document.addEventListener('visibilitychange', function v() { if (document.visibilityState === 'visible') { document.removeEventListener('visibilitychange', v); start(); } });
      return;
    }
    start();
  }
  var fonts = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
  window.addEventListener('load', function () {
    Promise.race([fonts, new Promise(function (r) { setTimeout(r, 1500); })]).then(function () { setTimeout(boot, 150); });
  });
})();
