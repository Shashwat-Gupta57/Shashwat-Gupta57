/* The build: the home page assembles itself in front of you, put together by the projects on it.
   Every project is a cursor in its own colour. The real page is hidden (visibility only, so nothing
   moves), taken apart into layers, and put back top to bottom: boxes are dragged out with a
   selection rectangle and a size label, text is typed in, the map, spider and terminal are wiped in.
   Tour mode scrolls along as each screen finishes; scrolling yourself takes over.
   Plays once per browser session; "Tour site" in the nav replays it. Esc or ✕ skips. Skipped under
   reduced motion (unless asked for), with ?build=off, and of course without JavaScript.
   The inline script in index.html's <head> hides the page before first paint (html.sw-on). */
(function () {
  'use strict';

  var root = document.documentElement;
  var BASE = root.getAttribute('data-base') || '';
  var SKIP = 'script, style, noscript, template, link, meta, br, wbr, .gate, .sw-ui';
  // pieces that are built as one unit: wiped in, never taken apart or typed into
  var ATOMS = '.cn, .term, .hz-end, img, svg, canvas, video, pre, [data-count], .decrypt';

  var state = null;   // the running build, or null
  var api = window.SGBuild = { running: false, pending: false, replay: replay, skip: function () { if (state) skip(); } };

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
  // Walks nav, main and footer in document order. A layer is anything that paints (box), holds text
  // (text) or is an atom. Inline elements inside a text layer belong to it, so a paragraph with a
  // <strong> in it is typed as one sentence.
  function capture() {
    var layers = [];
    var had = root.classList.contains('sw-on');
    root.classList.remove('sw-on');   // measure the page as it really is; nothing paints inside this task
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
    Array.prototype.forEach.call(document.querySelectorAll('body > header, body > main, body > footer'), function (s) { walk(s, null, null); });
    if (had) root.classList.add('sw-on');
    return layers;
  }

  /* ---------------- typing into the real text nodes ---------------- */
  // The untyped rest of each text node waits in an invisible span right after it, so the line
  // already takes its full space and nothing below shifts while the text comes in.
  function prepText(layer) {
    var nodes = [], walker = document.createTreeWalker(layer.el, NodeFilter.SHOW_TEXT), n;
    while ((n = walker.nextNode())) {
      if (!/\S/.test(n.nodeValue) || n.parentElement.__sw !== layer) continue;
      var ghost = document.createElement('span');
      ghost.setAttribute('data-sw-ghost', '');
      ghost.textContent = n.nodeValue;
      nodes.push({ node: n, full: n.nodeValue, ghost: ghost, shown: 0 });
    }
    nodes.forEach(function (t) { t.node.parentNode.insertBefore(t.ghost, t.node.nextSibling); t.node.nodeValue = ''; });
    layer.nodes = nodes;
    layer.total = nodes.reduce(function (s, t) { return s + t.full.length; }, 0);
    layer.typed = 0;
  }
  function typeTo(layer, count) {
    var left = count, last = null;
    layer.nodes.forEach(function (t) {
      var k = Math.max(0, Math.min(t.full.length, left));
      left -= t.full.length;
      if (k !== t.shown) { t.node.nodeValue = t.full.slice(0, k); t.ghost.textContent = t.full.slice(k); t.shown = k; }
      if (k > 0) last = t;
    });
    return last;
  }
  function finishText(layer) {
    if (!layer.nodes) return;
    layer.nodes.forEach(function (t) { t.node.nodeValue = t.full; if (t.ghost.parentNode) t.ghost.parentNode.removeChild(t.ghost); });
    layer.nodes = null;
  }
  function caretAt(layer) {
    var t = null;
    for (var i = layer.nodes.length - 1; i >= 0; i--) if (layer.nodes[i].shown > 0) { t = layer.nodes[i]; break; }
    try {
      var rg = document.createRange();
      if (t) { rg.setStart(t.node, t.shown); rg.collapse(true); }
      else rg.selectNodeContents(layer.nodes[0].ghost);
      var rs = rg.getClientRects(), r = rs[rs.length - 1] || rg.getBoundingClientRect();
      if (r && (r.height || r.width)) return { x: t ? r.right : r.left, y: r.top, h: r.height || 16 };
    } catch (e) { /* fall through */ }
    var b = layer.el.getBoundingClientRect();
    return { x: b.left, y: b.top, h: 16 };
  }

  /* ---------------- revealing ---------------- */
  function reveal(layer, how) {
    layer.el.setAttribute('data-sw', '1');
    if (how === 'wipe') layer.el.animate([{ clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0 0 0)' }], { duration: 650 / state.speed, easing: 'cubic-bezier(.16,1,.3,1)' });
    else if (how === 'pop') layer.el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 320 / state.speed, easing: 'ease-out' });
  }
  function done(layer) { layer.done = true; state.built++; }
  function instant(layer) { finishText(layer); reveal(layer); done(layer); }

  /* ---------------- sound: tiny clicks made in the browser, off until asked for ---------------- */
  var ac = null, lastTick = 0;
  function blip(freq, len, vol, type) {
    if (!state || !state.sound || !ac) return;
    var o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime;
    o.type = type || 'sine'; o.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.0001, t + len);
    o.connect(g); g.connect(ac.destination); o.start(t); o.stop(t + len);
  }
  function tick() { var n = performance.now(); if (n - lastTick < 45) return; lastTick = n; blip(1500 + Math.random() * 900, .025, .018, 'square'); }
  function pop() { blip(620 + Math.random() * 180, .09, .05); }

  /* ---------------- the agents ---------------- */
  function lum(hex) {
    var m = /^#?([0-9a-f]{6})$/i.exec(hex || ''); if (!m) return .5;
    var v = parseInt(m[1], 16);
    return (.2126 * (v >> 16 & 255) + .7152 * (v >> 8 & 255) + .0722 * (v & 255)) / 255;
  }
  function makeAgents() {
    var list = (window.PROJECTS || []).slice(0, 27);
    if (!list.length) list = [{ title: 'agent', poster: { to: '#ff6a3d' } }];
    var cx = innerWidth / 2, cy = innerHeight / 2;
    return list.map(function (p, i) {
      var c = (p.poster && p.poster.to) || '#ff6a3d', a = i / list.length * Math.PI * 2, r = 70 + (i % 3) * 26;
      return { p: p, color: c, ink: lum(c) > .62 ? '#0c0c0e' : '#fff', x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r,
               ang: a, rad: r, task: null, seed: Math.random() * 1000, side: i % 2 ? 1 : -1 };
    });
  }
  function rectOf(el) { return el.getBoundingClientRect(); }
  function ease(k) { return 1 - Math.pow(1 - k, 3); }

  function assign(ag, layer, now) {
    layer.taken = true;
    var r = rectOf(layer.el);
    var to = { x: r.left, y: r.top };
    if (layer.kind === 'text' && !layer.drag) { prepText(layer); var c = caretAt(layer); to = { x: c.x, y: c.y }; }
    var d = Math.hypot(to.x - ag.x, to.y - ag.y);
    ag.task = { layer: layer, phase: 'fly', t0: now, dur: Math.min(650, Math.max(220, d / 1.5)) / state.speed, from: { x: ag.x, y: ag.y }, to: to };
  }
  // one step of an agent's job: fly there, drag out the box (or type), hand the layer back
  function work(ag, now) {
    var tk = ag.task, L = tk.layer, k = Math.min(1, (now - tk.t0) / tk.dur);
    if (tk.phase === 'fly') {
      var e = ease(k), mx = (tk.from.x + tk.to.x) / 2, my = (tk.from.y + tk.to.y) / 2;
      var dx = tk.to.x - tk.from.x, dy = tk.to.y - tk.from.y, cxp = mx - dy * .18 * ag.side, cyp = my + dx * .18 * ag.side;
      ag.x = (1 - e) * (1 - e) * tk.from.x + 2 * (1 - e) * e * cxp + e * e * tk.to.x;
      ag.y = (1 - e) * (1 - e) * tk.from.y + 2 * (1 - e) * e * cyp + e * e * tk.to.y;
      if (k < 1) return;
      if (L.drag) { tk.phase = 'drag'; tk.t0 = now; tk.dur = 380 / state.speed; }
      else { tk.phase = 'type'; tk.t0 = now; reveal(L); }
      return;
    }
    if (tk.phase === 'drag') {
      var r = rectOf(L.el), g = ease(k);
      tk.box = { x: r.left, y: r.top, w: r.width * g, h: r.height * g, full: r };
      ag.x = r.left + r.width * g; ag.y = r.top + r.height * g;
      if (k < 1) return;
      state.fading.push({ x: r.left, y: r.top, w: r.width, h: r.height, color: ag.color, ink: ag.ink, born: now });
      tk.box = null;
      pop();
      if (L.kind === 'text') { prepText(L); reveal(L, 'pop'); tk.phase = 'type'; tk.t0 = now; return; }
      reveal(L, L.kind === 'atom' ? 'wipe' : 'pop');
      done(L); ag.task = null;
      return;
    }
    if (tk.phase === 'type') {
      var cps = Math.min(170, Math.max(32, L.total / .95)) * state.speed;
      var want = Math.min(L.total, Math.floor((now - tk.t0) / 1000 * cps));
      if (want > L.typed) { typeTo(L, want); L.typed = want; tick(); }
      var c = caretAt(L);
      tk.caret = c; ag.x = c.x + 3; ag.y = c.y + c.h * .55;
      if (L.typed < L.total) return;
      finishText(L); done(L); ag.task = null; tk.caret = null;
    }
  }

  /* ---------------- drawing: cursors, selection boxes, size labels, carets ---------------- */
  var MONO = '600 11px "JetBrains Mono", ui-monospace, monospace', SANS = '600 11px Inter, system-ui, sans-serif';
  function roundRect(x, y, w, h, r) { var c = state.ctx; c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
  function pill(text, x, y, bg, ink, font) {
    var c = state.ctx; c.font = font; var w = c.measureText(text).width + 12;
    roundRect(x, y, w, 18, 4); c.fillStyle = bg; c.fill();
    c.fillStyle = ink; c.textBaseline = 'middle'; c.fillText(text, x + 6, y + 9.5);
  }
  function selection(b, color, ink, alpha, label) {
    var c = state.ctx; c.globalAlpha = alpha;
    c.fillStyle = color; c.globalAlpha = alpha * .07; c.fillRect(b.x, b.y, b.w, b.h); c.globalAlpha = alpha;
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
    var c = state.ctx, W = innerWidth, H = innerHeight;
    c.clearRect(0, 0, W, H);
    state.fading = state.fading.filter(function (f) {
      var a = 1 - (now - f.born) / (420 / state.speed);
      if (a <= 0) return false;
      selection(f, f.color, f.ink, a * .9, true);
      return true;
    });
    state.agents.forEach(function (ag) {
      var tk = ag.task;
      if (tk && tk.box) selection(tk.box, ag.color, ag.ink, 1, true);
      if (tk && tk.phase === 'type' && tk.caret) {
        var r = rectOf(tk.layer.el);
        selection({ x: r.left - 3, y: r.top - 2, w: r.width + 6, h: r.height + 4 }, ag.color, ag.ink, .55, false);
        if ((now / 380 | 0) % 2 === 0) { c.fillStyle = ag.color; c.fillRect(tk.caret.x, tk.caret.y, 2, tk.caret.h); }
      }
    });
    state.agents.forEach(function (ag) {
      c.globalAlpha = ag.alpha == null ? 1 : ag.alpha;
      var typing = ag.task && ag.task.phase === 'type';
      if (typing) ibeam(ag); else arrow(ag);
      if (ag.task && ag.task.phase !== 'fly') pill(ag.p.title, ag.x + 14, ag.y + 16, ag.color, ag.ink, SANS);
      c.globalAlpha = 1;
    });
  }

  /* ---------------- the HUD ---------------- */
  function hudHTML(n, total) {
    var icons = (window.PROJECTS || []).filter(function (p) { return p.poster && p.poster.icon; }).slice(0, 5);
    return '<span class="sw-avs" aria-hidden="true">' + icons.map(function (p) { return '<img src="' + BASE + p.poster.icon + '" alt="" />'; }).join('') + '</span>' +
      '<span class="sw-msg"><b>' + n + '</b> agents</span>' +
      '<span class="sw-sep" aria-hidden="true"></span>' +
      '<span class="sw-layers"><b data-sw-built>0</b> / ' + total + ' layers</span>' +
      '<span class="sw-bar" aria-hidden="true"><i></i></span>' +
      '<button type="button" data-a="tour" aria-pressed="true">Touring</button>' +
      '<button type="button" data-a="speed" aria-label="Build speed">1×</button>' +
      '<button type="button" data-a="sound" aria-pressed="false"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4z"/><path class="sw-wave" d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12"/></svg><span>Tap for sound</span></button>' +
      '<button type="button" data-a="skip" aria-label="Skip the build (Esc)">✕</button>';
  }
  function setTour(on) {
    state.tour = on;
    var b = state.hud.querySelector('[data-a="tour"]');
    if (b) b.setAttribute('aria-pressed', String(on));
  }

  /* ---------------- the loop ---------------- */
  function frame(now) {
    if (!state) return;
    state.raf = requestAnimationFrame(frame);
    var W = innerWidth, H = innerHeight, dt = now - (state.last || now); state.last = now;

    if (state.phase === 'scan') {
      // the swarm circles the monogram while the page is "scanned"
      var k = Math.min(1, (now - state.t0) / (1500 / state.speed));
      state.agents.forEach(function (ag) {
        ag.ang += dt * .0022 * (ag.side > 0 ? 1 : 1.25);
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
      // hand out work: the earliest layers whose parent is built, if they're on screen
      var idle = state.agents.filter(function (a) { return !a.task; }), inView = false, scanned = 0;
      for (var i = state.head; i < state.layers.length && scanned < 140; i++) {
        var L = state.layers[i];
        if (L.done) { if (i === state.head) state.head++; continue; }
        if (L.taken) continue;
        scanned++;
        if (L.parent && !L.parent.done) continue;
        var r = rectOf(L.el);
        if (!r.width || !r.height || r.bottom < 0 || r.right < 0 || r.height > H * 1.2 || r.width * r.height > W * H * 1.3) { instant(L); continue; }
        if (r.top > H * .97 || r.left > W * .97) continue;
        inView = true;
        if (!idle.length) break;
        var best = 0, bd = Infinity;
        idle.forEach(function (a, j) { var d = Math.hypot(a.x - r.left, a.y - r.top); if (d < bd) { bd = d; best = j; } });
        assign(idle.splice(best, 1)[0], L, now);
      }
      state.agents.forEach(function (a) {
        if (a.task) work(a, now);
        else { a.x += Math.sin(now / 700 + a.seed) * .25; a.y += Math.cos(now / 900 + a.seed) * .25; }
      });
      var busy = state.agents.some(function (a) { return a.task; });

      // tour: once this screen is built, glide down to the next
      if (state.tour && !busy && !inView && !state.scroll) {
        var max = document.documentElement.scrollHeight - H;
        if (scrollY < max - 2) state.scroll = { from: scrollY, to: Math.min(max, scrollY + H * .72), t0: now, dur: 900 / state.speed };
      }
      if (state.scroll) {
        var s = state.scroll, sk = Math.min(1, (now - s.t0) / s.dur), se = sk < .5 ? 2 * sk * sk : 1 - Math.pow(-2 * sk + 2, 2) / 2;
        window.scrollTo({ top: s.from + (s.to - s.from) * se, behavior: 'instant' });
        if (sk >= 1) state.scroll = null;
      }
      // nothing left on screen, nothing more below: whatever never came into view simply appears
      if (!busy && !inView && !state.scroll) {
        var atEnd = scrollY >= document.documentElement.scrollHeight - H - 2;
        state.stall = atEnd ? (state.stall || now) : 0;
        if (state.stall && now - state.stall > 900) state.layers.forEach(function (l) { if (!l.done) instant(l); });
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
    state.hud.innerHTML = '<span class="sw-msg">Built by <b>' + state.agents.length + '</b> projects in <b>' + secs + 's</b></span>' +
      '<button type="button" data-a="replay">↻ Replay</button><button type="button" data-a="close" aria-label="Close">✕</button>';
    var hud = state.hud;
    setTimeout(function () { hud.classList.add('sw-gone'); setTimeout(function () { hud.remove(); }, 600); }, 5200);
  }

  // undo everything the build touched, leaving the page exactly as it was
  function teardown(removeHud) {
    if (!state) return;
    cancelAnimationFrame(state.raf);
    state.layers.forEach(function (l) { finishText(l); l.el.removeAttribute('data-sw'); delete l.el.__sw; });
    Array.prototype.forEach.call(document.querySelectorAll('[data-sw-ghost]'), function (g) { g.remove(); });
    root.classList.remove('sw-on');
    state.canvas.remove(); state.tile.remove();
    if (removeHud) state.hud.remove();
    document.removeEventListener('keydown', state.onKey);
    ['wheel', 'touchstart'].forEach(function (ev) { window.removeEventListener(ev, state.onUser); });
    state = null; api.running = false;
    if (/[?&](tour|build=1)\b/.test(location.search)) history.replaceState(null, '', location.pathname + location.hash);
  }
  function skip() {
    if (!state) return;
    state.layers.forEach(function (l) { if (!l.done) instant(l); });
    teardown(true);
  }

  /* ---------------- start ---------------- */
  function start() {
    if (state) return;
    api.pending = false;
    root.classList.add('sw-on');
    try { sessionStorage.setItem('sg-built', '1'); } catch (e) {}
    Array.prototype.forEach.call(document.querySelectorAll('[data-reveal]'), function (el) { el.classList.add('in'); });
    var layers;
    try { layers = capture(); } catch (e) { root.classList.remove('sw-on'); return; }
    if (!layers.length) { root.classList.remove('sw-on'); return; }

    var canvas = document.createElement('canvas'); canvas.className = 'sw-canvas sw-ui'; canvas.setAttribute('aria-hidden', 'true');
    var tile = document.createElement('div'); tile.className = 'sw-tile sw-ui'; tile.setAttribute('aria-hidden', 'true'); tile.textContent = 'SG';
    var hud = document.createElement('div'); hud.className = 'sw-hud sw-ui'; hud.setAttribute('role', 'status');
    document.body.appendChild(canvas); document.body.appendChild(tile); document.body.appendChild(hud);
    var agents = makeAgents();
    hud.innerHTML = hudHTML(agents.length, layers.length);

    state = { layers: layers, agents: agents, canvas: canvas, ctx: canvas.getContext('2d'), tile: tile, hud: hud, fading: [],
              built: 0, head: 0, speed: 1, tour: true, sound: false, phase: 'scan', t0: performance.now() };
    state.msg = hud.querySelector('.sw-msg'); state.msg.innerHTML = 'Scanning page…';
    state.builtEl = hud.querySelector('[data-sw-built]'); state.barI = hud.querySelector('.sw-bar i');
    api.running = true;

    function size() {
      var d = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = innerWidth * d; canvas.height = innerHeight * d;
      state && state.ctx.setTransform(d, 0, 0, d, 0, 0);
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

  // "Tour site" in the nav replays the build here (other pages link to index.html?tour)
  Array.prototype.forEach.call(document.querySelectorAll('[data-tour]'), function (a) {
    a.addEventListener('click', function (e) { e.preventDefault(); replay(); });
  });

  // Boot only if the head script decided this visit gets the build. Wait for fonts (so text is
  // measured in the right typeface), a visible tab, and the privacy note to be signed.
  if (!root.classList.contains('sw-on')) return;
  api.pending = true;
  function boot() {
    var gate = document.querySelector('.gate');
    if (gate) { document.addEventListener('sg:gate-closed', function () { setTimeout(start, 500); }, { once: true }); return; }
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
