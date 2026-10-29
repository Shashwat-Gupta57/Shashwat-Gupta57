/* HTML builders shared by the browser (js/main.js) and the static page generator
   (tools/build-pages.js). Pure string functions: no DOM, so they run in Node too.

   Usage: var R = SiteRender(base, projects, categories);
          R.cardHTML(p), R.renderProject(p), R.projectHref(p) …            */
(function (root) {
  'use strict';

  function SiteRender(BASE, PROJECTS, CATS, DOCS_, STRUCTURE_, RELEASES_) {
    BASE = BASE || '';
    CATS = CATS || {};

    function esc(s) {
      return String(s).replace(/[&<>"']/g, function (c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
      });
    }
    // every project has its own small site: projects/<id>/
    function projectHref(p) { return BASE + (p.page || 'projects/' + p.id + '/'); }
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

    // A project's own page: a small site tinted with its poster colour. Every section is
    // optional and only renders when the project has that kind of content.
    function renderProject(p) {
      var idx = PROJECTS.indexOf(p);
      var pz = p.poster || {};
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

      var navItems = [];
      if (p.story || p.body) navItems.push(['story', 'Story']);
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

      if (p.showcase) html += p.showcase; // a project's own hand-written section (raw HTML)

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
        html += section('install', head('Install', 'Get it <em>running.</em>', p.installNote || '') +
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

      if (shots.length) {
        html += '<div class="lightbox" id="lightbox" hidden role="dialog" aria-modal="true" aria-label="Screenshot">' +
          '<button class="lb-close mono" aria-label="Close">esc ✕</button><button class="lb-nav lb-prev" aria-label="Previous">‹</button>' +
          '<figure><img alt="" /><figcaption class="mono"></figcaption></figure><button class="lb-nav lb-next" aria-label="Next">›</button></div>';
      }
      return html;
    }


    /* ================= project mini-sites: projects/<id>/{index,docs,download}.html ================= */
    var DOCS = DOCS_ || {}, STRUCTURE = STRUCTURE_ || {}, RELEASES = RELEASES_ || {};

    function fmtSize(b) { return b > 1048576 ? (b / 1048576).toFixed(1) + ' MB' : Math.max(1, Math.round(b / 1024)) + ' KB'; }
    function ghLink(p) { var l = (p.links || []).filter(function (x) { return /github\.com/.test(x.href); })[0]; return l ? l.href : null; }
    function mark(p, cls) {
      var pz = p.poster || {};
      return pz.icon
        ? '<img class="' + cls + (pz.bare ? ' bare' : '') + (pz.pixel ? ' pixel' : '') + '" src="' + esc(BASE + pz.icon) + '" alt="" />'
        : '<span class="' + cls + ' pv-logo-glyph mono" aria-hidden="true">' + esc(pz.glyph || p.title.charAt(0)) + '</span>';
    }

    // the product-style top bar every page of a project's site shares
    function siteNav(p, active) {
      var gh = ghLink(p);
      var tab = function (href, label, key) { return '<a href="' + href + '"' + (active === key ? ' aria-current="page"' : '') + '>' + label + '</a>'; };
      return '<header class="ms-nav" id="nav"><div class="wrap ms-nav-inner">' +
        '<a class="ms-brand" href="index.html">' + mark(p, 'ms-logo') + '<span>' + esc(p.title) + '</span></a>' +
        '<nav class="ms-tabs mono" aria-label="' + esc(p.title) + '">' + tab('index.html', 'Overview', 'home') + tab('docs.html', 'Docs', 'docs') + tab('download.html', 'Download', 'download') +
          (gh ? '<a href="' + esc(gh) + '" target="_blank" rel="noopener">GitHub ↗</a>' : '') + '</nav>' +
        '<a class="ms-home mono" href="' + BASE + 'work.html" title="Shashwat Gupta — all projects"><span class="brand-mark">SG</span><span class="ms-home-label">all projects</span></a>' +
        '<button class="theme-btn" id="themeBtn" aria-label="Toggle colour theme"><svg class="i-sun" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg><svg class="i-moon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z"/></svg></button>' +
      '</div></header>';
    }

    function counter() {
      var n = 0;
      return function (eyebrow, title, sub) {
        n++;
        return '<header class="sec-head" data-reveal><span class="sec-num mono">' + (n < 10 ? '0' : '') + n + '</span>' +
          '<div><p class="eyebrow mono">' + esc(eyebrow) + '</p><h2 class="sec-title">' + title + '</h2></div>' +
          (sub ? '<p class="sec-sub">' + esc(sub) + '</p>' : '') + '</header>';
      };
    }
    function sec(idName, inner, cls) { return '<section class="section pv-sec' + (cls ? ' ' + cls : '') + '" id="' + idName + '"><div class="wrap">' + inner + '</div></section>'; }
    function pager(p) {
      var idx = PROJECTS.indexOf(p);
      var prev = PROJECTS[(idx - 1 + PROJECTS.length) % PROJECTS.length], next = PROJECTS[(idx + 1) % PROJECTS.length];
      return '<nav class="wrap pv-pager mono" aria-label="More projects">' +
        '<a href="' + esc(projectHref(prev)) + '"><span class="dim">← previous project</span>' + esc(prev.title) + '</a>' +
        '<a href="' + esc(projectHref(next)) + '"><span class="dim">next project →</span>' + esc(next.title) + '</a></nav>';
    }
    function lightbox(p) {
      return (p.shots || []).length ? '<div class="lightbox" id="lightbox" hidden role="dialog" aria-modal="true" aria-label="Screenshot">' +
        '<button class="lb-close mono" aria-label="Close">esc ✕</button><button class="lb-nav lb-prev" aria-label="Previous">‹</button>' +
        '<figure><img alt="" /><figcaption class="mono"></figcaption></figure><button class="lb-nav lb-next" aria-label="Next">›</button></div>' : '';
    }
    function heroFor(p, title, sub, actions, media) {
      var pz = p.poster || {};
      return '<section class="pv-hero pv-hero-site" data-paths="flow" data-paths-mirror data-paths-color="' + esc(pz.to || '#888') + '" data-paths-opacity="0.55">' +
        '<div class="wrap"><div class="pv-hero-grid' + (media ? '' : ' pv-hero-solo') + '">' +
          '<div class="pv-hero-copy">' + mark(p, 'pv-logo') +
            '<p class="eyebrow mono">' + esc(CATS[p.category] || p.category) + ' · ' + esc(p.year) + (p.status ? ' <span class="pcard-status">' + esc(p.status) + '</span>' : '') + '</p>' +
            '<h1 class="pv-title"><span class="decrypt" data-text="' + esc(title) + '">' + esc(title) + '</span></h1>' +
            '<p class="pv-tagline">' + sub + '</p>' + (actions || '') +
          '</div>' + (media ? '<div class="pv-hero-media">' + media + '</div>' : '') +
        '</div></div></section>';
    }

    /* ---------- landing ---------- */
    function renderLanding(p) {
      var d = DOCS[p.id] || {}, head = counter(), pz = p.poster || {}, shots = p.shots || [], rel = RELEASES[p.id];
      var gh = ghLink(p);
      var actions = '<ul class="pcard-tags mono">' + p.tags.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ul>' +
        '<div class="pv-links">' +
          '<a class="btn btn-solid" href="download.html">' + (rel ? 'Download ' + esc(rel.tag) : 'Get it') + ' <span aria-hidden="true">↓</span></a>' +
          '<a class="btn btn-ghost" href="docs.html">Read the docs</a>' +
          (d.site ? '<a class="btn btn-ghost" href="' + esc(d.site.href) + '" target="_blank" rel="noopener">' + esc(d.site.label) + ' ↗</a>' : '') +
          (gh ? '<a class="btn btn-ghost" href="' + esc(gh) + '" target="_blank" rel="noopener">GitHub ↗</a>' : '') +
          (p.links || []).filter(function (l) { return l.internal; }).map(function (l) { return linkHTML(l, 'btn btn-ghost'); }).join('') +
        '</div>';
      var media = shots.length
        ? '<button class="pv-hero-shot window" data-open="0" aria-label="Enlarge screenshot"><div class="window-bar"><span class="dots" aria-hidden="true"><i></i><i></i><i></i></span><span class="mono">' + esc(p.title) + '</span></div><img src="' + esc(BASE + shots[0].src) + '" alt="' + esc(shots[0].caption) + '" /></button>'
        : posterHTML(p, true);
      var html = heroFor(p, p.title, esc(p.tagline), actions, media);

      if (p.stats) html += '<div class="wrap"><div class="tk-facts pv-facts">' + p.stats.map(function (s) { return '<div data-reveal><b>' + esc(s[0]) + '</b><span>' + esc(s[1]) + '</span></div>'; }).join('') + '</div></div>';

      var hl = p.highlights || (p.features || []).map(function (f) { return { t: f, d: '' }; });
      if (hl.length) {
        var items = hl.map(function (h) { return '<span>' + esc(h.t) + '</span>'; }).join('<i aria-hidden="true">✦</i>');
        html += '<div class="ms-marquee mono" aria-hidden="true"><div class="ms-marquee-track">' + items + '<i>✦</i>' + items + '<i>✦</i></div></div>';
      }

      if (p.story) {
        html += sec('story', head('The story', 'Why <em>' + esc(p.title) + '</em>', '') +
          '<div class="pv-story" data-reveal>' + p.story.map(function (t, i) { return '<p' + (i === 0 ? ' class="lead"' : '') + '>' + esc(t) + '</p>'; }).join('') + '</div>');
      }
      if (p.showcase) html += p.showcase;

      // deep dives: each screenshot gets its own row, paired with a highlight
      if (shots.length > 1) {
        html += sec('tour', head('The tour', 'See it <em>running.</em>', 'Real screenshots, captured from the app itself. Click any to enlarge.') +
          shots.map(function (s, i) {
            // a shot can carry its own title/text; otherwise its caption is the heading
            var h = { t: s.t || s.caption, d: s.d || '' };
            return '<div class="ms-row' + (i % 2 ? ' flip' : '') + '" data-reveal>' +
              '<button class="pv-shot-btn ms-row-shot" data-open="' + i + '" aria-label="Enlarge: ' + esc(s.caption) + '"><img src="' + esc(BASE + s.src) + '" alt="' + esc(s.caption) + '" loading="lazy" decoding="async" /></button>' +
              '<div class="ms-row-copy"><span class="mono ms-row-n">' + (i < 9 ? '0' : '') + (i + 1) + ' / ' + (shots.length < 10 ? '0' : '') + shots.length + '</span>' +
                '<h3>' + esc(h.t) + '</h3>' + (h.d ? '<p>' + esc(h.d) + '</p>' : '') + '</div>' +
            '</div>';
          }).join(''));
      }

      if (hl.length) {
        html += sec('highlights', head('Everything it does', 'Every <em>feature.</em>', '') +
          '<div class="feature-grid">' + hl.map(function (h, i) {
            return '<article data-reveal><span class="f-ico">' + (i < 9 ? '0' : '') + (i + 1) + '</span><h3>' + esc(h.t) + '</h3>' + (h.d ? '<p>' + esc(h.d) + '</p>' : '') + '</article>';
          }).join('') + '</div>');
      }

      if (p.terminal) {
        html += '<section class="pv-sec"><div class="wrap"><div class="term pv-term" data-reveal><div class="term-bar"><span class="dots" aria-hidden="true"><i></i><i></i><i></i></span><span class="mono term-title">' + esc(p.terminal.title) + '</span></div>' +
          '<pre class="term-screen pv-term-out mono"><span class="pv-prompt">$ ' + esc(p.terminal.cmd) + '</span>\n\n' + esc(p.terminal.out) + '</pre></div></div></section>';
      }

      if (p.build && p.build.length) {
        html += sec('architecture', head('Architecture', 'How it’s <em>built.</em>', '') +
          '<div class="ms-flow" data-reveal>' + p.build.map(function (b, i) {
            return (i ? '<span class="ms-flow-arrow" aria-hidden="true">→</span>' : '') + '<div class="ms-flow-node"><span class="mono">' + esc(b[0]) + '</span><b>' + esc(b[1]) + '</b></div>';
          }).join('') + '</div>');
      }

      if (d.usecases) {
        html += sec('for', head('Perfect for', 'Made <em>for you.</em>', '') +
          '<div class="custom-grid">' + d.usecases.map(function (u) { return '<article data-reveal><h3>' + esc(u.t) + '</h3><p>' + esc(u.d) + '</p></article>'; }).join('') + '</div>');
      }

      html += '<section class="wrap ms-cta-wrap"><div class="launch-card ms-cta" data-paths="waves" data-paths-count="24" data-paths-color="' + esc(pz.to || '#888') + '" data-paths-opacity="0.35" data-reveal>' +
        '<p class="eyebrow mono">' + esc(p.title) + (rel ? ' · ' + esc(rel.tag) : '') + '</p><h2>Ready to try <em>' + esc(p.title) + '</em>?</h2>' +
        '<p>' + (rel ? 'Free and open source. Download it, unzip it, run it.' : (d.site ? 'It has its own home at ' + esc(d.site.label) + '.' : 'Read how it works, from the ground up.')) + '</p>' +
        '<div class="tk-actions"><a class="btn btn-solid" href="download.html">' + (rel ? 'Download' : 'Get it') + '</a><a class="btn btn-ghost" href="docs.html">Docs</a></div></div></section>';

      return siteNav(p, 'home') + '<main id="main"><div id="pview" data-project="' + esc(p.id) + '">' + html + pager(p) + lightbox(p) + '</div></main>';
    }

    /* ---------- docs ---------- */
    var JRE_STEPS = [
      { t: 'Install Java once', d: 'Download the JRE Installer, unzip it and click Start Installing JRE — no admin rights. (Skip this if you already have Java 21 or newer.)' },
      { t: 'Download the app', d: 'Grab the zip from the Download page.' },
      { t: 'Unzip anywhere writable', d: 'Desktop or Documents — the app saves its settings in its own folder.' },
      { t: 'Run the .exe', d: 'Windows SmartScreen may warn on first run because the exe isn’t code-signed: More info → Run anyway.' }
    ];
    // entry point of each published app, for the build-from-source snippet
    var MAIN_CLASS = { 'rex-run': 'rexRun', 'notes': 'Notes', 'widgets': 'WeatherWidget', 'terminal-game': 'Terminal_game2_basic' };
    var EXE_FAQ = [
      { q: '“needs Java 21 or newer”', a: 'Install Java once with the JRE Installer (github.com/Shashwat-Gupta57/JRE-Installer), or point JAVA_HOME at a Java 21+ install.' },
      { q: 'Windows SmartScreen blocked it.', a: 'The exe isn’t code-signed. Click More info → Run anyway. The source is public on GitHub if you’d rather build it yourself.' },
      { q: 'My settings or scores don’t save.', a: 'The app writes next to its exe. Unzip it somewhere you can write to, not inside Program Files.' },
      { q: 'Where does it look for Java?', a: '%LOCALAPPDATA%\\OpenJDK Adoptium JRE - SG\\JRE first (where the JRE Installer puts it), then %JAVA_HOME%.' }
    ];

    function table(head, rows) {
      return '<div class="ms-table-wrap"><table class="ms-table"><thead><tr>' + head.map(function (h) { return '<th class="mono">' + esc(h) + '</th>'; }).join('') + '</tr></thead><tbody>' +
        rows.map(function (r) { return '<tr>' + r.map(function (c, i) { return '<td' + (i === 0 ? ' class="mono"' : '') + '>' + c + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table></div>';
    }
    function steps(list) {
      return '<ol class="ms-steps">' + list.map(function (s) { return '<li><b>' + esc(s.t) + '</b><span>' + esc(s.d) + '</span></li>'; }).join('') + '</ol>';
    }

    function renderDocs(p) {
      var d = DOCS[p.id] || {}, rel = RELEASES[p.id], st = STRUCTURE[p.id], gh = ghLink(p);
      var exeApp = !!rel && /windows\.zip$/.test((rel.assets[0] || {}).name || '');
      var parts = [];
      var add = function (id, title, body) { parts.push({ id: id, title: title, body: body }); };

      add('overview', 'Overview', '<p class="lead">' + esc(p.tagline) + '</p>' + (p.story ? '<p>' + esc(p.story[0]) + '</p>' : '') +
        (p.stats ? '<div class="ms-kv">' + p.stats.map(function (s) { return '<div><b>' + esc(s[0]) + '</b><span>' + esc(s[1]) + '</span></div>'; }).join('') + '</div>' : ''));

      if (exeApp) {
        add('getting-started', 'Getting started', '<p>Requirements: <b>Windows 10 or 11</b> and <b>Java 21+</b> (the JRE Installer sets it up in one click).</p>' + steps(JRE_STEPS));
      } else if (p.install) {
        add('getting-started', 'Getting started', (p.installNote ? '<p>' + esc(p.installNote) + '</p>' : '') +
          p.install.map(function (t) { return '<p class="mono ms-code-label">' + esc(t.label) + '</p><div class="pv-code"><pre class="mono">' + esc(t.code) + '</pre><button class="pv-copy mono" data-copy>copy</button></div>'; }).join(''));
      } else {
        add('getting-started', 'Getting started', d.site
          ? '<p>' + esc(p.title) + ' has its own website with downloads: <a class="ink-link" href="' + esc(d.site.href) + '" target="_blank" rel="noopener">' + esc(d.site.label) + '</a>.</p>'
          : '<p>' + (p.status ? esc(p.title) + ' is ' + esc(p.status) + '. ' : '') + (gh ? 'The source is on <a class="ink-link" href="' + esc(gh) + '" target="_blank" rel="noopener">GitHub</a>.' : 'It isn’t publicly released yet — this page documents how it works.') + '</p>');
      }

      if (d.controls) add('controls', d.controlsTitle || 'Controls', table(['Key / tool', 'Action'], d.controls.map(function (c) { return ['<kbd>' + esc(c.keys) + '</kbd>', esc(c.action)]; })));
      if (d.guide) add('guide', 'How to use it', steps(d.guide));
      if (p.commands) add('commands', 'Commands', table(['Command', 'What it does'], p.commands.map(function (c) { return ['<code>' + esc(c.cmd) + '</code>', esc(c.d)]; })));
      if (d.files) add('files', 'Files & configuration', '<p>Everything the app reads or writes lives next to it:</p>' + table(['File', 'Purpose'], d.files.map(function (f) { return ['<code>' + esc(f.name) + '</code>', esc(f.d)]; })));
      if (p.api) {
        var total = p.api.reduce(function (n, g) { return n + g.items.length; }, 0);
        add('api', 'API reference', '<p>' + total + ' public methods across ' + p.api.length + ' groups.</p><label class="sr" for="apiFilter">Filter methods</label><input id="apiFilter" class="cipher-input pv-api-filter" type="search" placeholder="filter — e.g. upload, token, folder" autocomplete="off" spellcheck="false" />' +
          p.api.map(function (g, i) {
            return '<div class="pv-api-group" id="api-' + i + '"><h3 class="mono">' + esc(g.group) + '</h3>' + (g.intro ? '<p class="pv-api-intro">' + esc(g.intro) + '</p>' : '') +
              g.items.map(function (it) { return '<div class="pv-api-item"><code class="mono">' + esc(it.sig) + '</code><p>' + esc(it.d) + '</p></div>'; }).join('') + '</div>';
          }).join('') + '<p class="pv-api-empty" hidden>No methods match.</p>');
      }
      if (p.build) add('architecture', 'Architecture', table(['Layer', 'Built with'], p.build.map(function (b) { return [esc(b[0]), esc(b[1])]; })));
      if (st && st.length) {
        var lines = st.reduce(function (n, e) { return n + e.lines; }, 0);
        add('structure', 'Project structure', '<p>' + st.length + ' entries, ' + lines.toLocaleString('en-US') + ' lines of code — counted from the source.</p>' +
          table(['Path', 'Lines', 'What it is'], st.map(function (e) {
            return ['<code>' + esc(e.name) + '</code>', e.lines.toLocaleString('en-US'), esc(e.kind || '') + (e.files ? '<br><span class="dim mono">' + esc(e.files.join(', ')) + '</span>' : '')];
          })));
      }
      if (exeApp || (gh && st)) {
        add('build', 'Build from source', gh
          ? '<div class="pv-code"><pre class="mono">git clone ' + esc(gh) + (p.id === 'widgets' ? ' -b weather' : '') + '\ncd ' + esc(gh.split('/').pop()) + '\njavac *.java\njava ' + esc(MAIN_CLASS[p.id] || 'main') + '</pre><button class="pv-copy mono" data-copy>copy</button></div>' +
            '<p>Every one of these is also a BlueJ project — open its folder in BlueJ and run <code>main()</code>.</p>'
          : '');
      }
      if (d.notes) add('notes', 'Notes', d.notes.map(function (t) { return '<p>' + esc(t) + '</p>'; }).join(''));
      var faq = (d.faq || []).concat(exeApp ? EXE_FAQ : []);
      if (faq.length) add('faq', 'FAQ & troubleshooting', faq.map(function (f) { return '<details class="ms-faq"><summary>' + esc(f.q) + '</summary><p>' + esc(f.a) + '</p></details>'; }).join(''));
      add('license', 'License & links', '<p>' + (gh ? 'Open source under the <b>GPL-3.0</b> licence. Source: <a class="ink-link" href="' + esc(gh) + '" target="_blank" rel="noopener">' + esc(gh.replace('https://', '')) + '</a>.' : '© Shashwat Gupta · Flex Studios.') + '</p>' +
        '<p>Made by <a class="ink-link" href="' + BASE + 'index.html">Shashwat Gupta</a>.</p>');

      var html = heroFor(p, p.title + ' Docs', 'Everything about ' + esc(p.title) + ' — from first run to the last line of its source.', '', '') +
        '<div class="wrap ms-docs"><aside class="ms-toc mono" aria-label="On this page"><p class="dim">On this page</p>' +
          parts.map(function (s) { return '<a href="#' + s.id + '">' + esc(s.title) + '</a>'; }).join('') + '</aside>' +
          '<article class="ms-doc">' + parts.map(function (s) { return '<section id="' + s.id + '" class="ms-doc-sec"><h2>' + esc(s.title) + '</h2>' + s.body + '</section>'; }).join('') + '</article></div>';
      return siteNav(p, 'docs') + '<main id="main"><div id="pview" data-project="' + esc(p.id) + '">' + html + pager(p) + '</div></main>';
    }

    /* ---------- download ---------- */
    function renderDownload(p) {
      var d = DOCS[p.id] || {}, rel = RELEASES[p.id], gh = ghLink(p);
      var exeApp = !!rel && /windows\.zip$/.test((rel.assets[0] || {}).name || '');
      var body = '';
      if (rel) {
        body += '<div class="ms-release" data-reveal><div class="ms-release-head"><div><p class="eyebrow mono">Latest release</p><h2>' + esc(rel.name) + '</h2></div>' +
          '<p class="mono dim">' + esc(rel.tag) + ' · ' + esc(rel.date) + ' · <a class="ink-link" href="' + esc(rel.url) + '" target="_blank" rel="noopener">release notes ↗</a></p></div>' +
          rel.assets.map(function (a) {
            return '<div class="ms-asset"><div class="ms-asset-name"><b class="mono">' + esc(a.name) + '</b><span class="dim mono">' + fmtSize(a.size) + '</span></div>' +
              (a.sha256 ? '<div class="ms-sha mono"><span class="dim">sha256</span> <code>' + esc(a.sha256) + '</code></div>' : '') +
              '<a class="btn btn-solid" href="' + esc(a.url) + '">Download <span aria-hidden="true">↓</span></a></div>';
          }).join('') + '</div>';
      }
      if (exeApp) {
        body += '<div class="two-col ms-dl-cols"><div data-reveal><h3 class="ms-h3">Install in four steps</h3>' + steps(JRE_STEPS) + '</div>' +
          '<div data-reveal><h3 class="ms-h3">Requirements</h3><ul class="pv-features"><li>Windows 10 or 11 (64-bit)</li><li>Java 21 or newer — <a class="ink-link" href="' + BASE + 'projects/jre-installer/download.html">get it in one click</a></li><li>About ' + fmtSize(rel.assets[0].size * 1.4) + ' of disk space</li></ul>' +
          '<h3 class="ms-h3">Verify the download</h3><div class="pv-code"><pre class="mono">Get-FileHash .\\' + esc(rel.assets[0].name) + ' -Algorithm SHA256</pre><button class="pv-copy mono" data-copy>copy</button></div><p class="fine">The hash must match the sha256 above.</p></div></div>';
      }
      if (p.install && !exeApp) {
        body += '<div class="pv-tabs" data-reveal><div class="pv-tablist mono" role="tablist">' +
          p.install.map(function (t, i) { return '<button role="tab" aria-selected="' + (i === 0) + '" data-tab="' + i + '">' + esc(t.label) + '</button>'; }).join('') + '</div>' +
          p.install.map(function (t, i) { return '<div class="pv-code" data-panel="' + i + '"' + (i ? ' hidden' : '') + '><pre class="mono">' + esc(t.code) + '</pre><button class="pv-copy mono" data-copy>copy</button></div>'; }).join('') + '</div>';
      }
      if (d.site) body += '<div class="ms-release" data-reveal><p class="eyebrow mono">Official site</p><h2>' + esc(p.title) + ' lives at <a class="ink-link" href="' + esc(d.site.href) + '" target="_blank" rel="noopener">' + esc(d.site.label) + '</a></h2><p>Downloads, updates and everything else are there.</p></div>';
      if (!body) {
        body = '<div class="ms-release" data-reveal><p class="eyebrow mono">' + esc(p.status || 'not released yet') + '</p><h2>No public download yet</h2><p>' +
          (gh ? 'The source is public — <a class="ink-link" href="' + esc(gh) + '" target="_blank" rel="noopener">browse it on GitHub</a>.' : esc(p.title) + ' isn’t publicly released. The <a class="ink-link" href="docs.html">docs</a> explain how it works.') + '</p></div>';
      }
      var html = heroFor(p, 'Get ' + p.title, rel ? 'Version ' + esc(rel.tag.replace(/^v/, '')) + ' · released ' + esc(rel.date) + ' · free and open source.' : esc(p.tagline), '', '') +
        '<section class="section pv-sec"><div class="wrap">' + body + '</div></section>';
      return siteNav(p, 'download') + '<main id="main"><div id="pview" data-project="' + esc(p.id) + '">' + html + pager(p) + '</div></main>';
    }


    /* ================= portfolio showcase: the ls -la archive ================= */
    function heroImage(p) {
      return p.cover || (p.shots && p.shots[0] && p.shots[0].src) || null;
    }
    function locOf(p) {
      var st = STRUCTURE[p.id];
      if (st && st.length) return st.reduce(function (n, e) { return n + e.lines; }, 0);
      var s = (p.stats || []).filter(function (x) { return /line/.test(x[1]); })[0];
      return s ? parseInt(String(s[0]).replace(/[^\d]/g, ''), 10) || 0 : 0;
    }

    // one line of the archive, styled like `ls -la`; hovering shows a floating preview
    function lsRow(p) {
      var pz = p.poster || {}, img = heroImage(p), loc = locOf(p);
      var perms = (RELEASES[p.id] ? '-rwx' : '-rw-') + (ghLink(p) ? 'r-x' : '---') + 'r--';
      return '<a class="ls-row" href="' + esc(projectHref(p)) + '" data-cat="' + esc(p.category) + '"' +
        ' data-preview="' + esc(img ? BASE + img : '') + '" data-icon="' + esc(pz.icon ? BASE + pz.icon : '') + '" style="--p-to:' + esc(pz.to || '#888') + ';--p-from:' + esc(pz.from || '#222') + '">' +
        '<span class="ls-perm mono">' + perms + '</span>' +
        '<span class="ls-year mono">' + esc(String(p.year).replace(/ – now/, '→')) + '</span>' +
        '<span class="ls-cat mono">' + esc(CATS[p.category] || p.category) + '</span>' +
        '<span class="ls-loc mono">' + (loc ? loc.toLocaleString('en-US') : '—') + '</span>' +
        '<span class="ls-name">' + (pz.icon ? '<img class="ls-icon' + (pz.bare ? ' bare' : '') + (pz.pixel ? ' pixel' : '') + '" src="' + esc(BASE + pz.icon) + '" alt="" loading="lazy" />' : '<span class="ls-icon ls-glyph mono">' + esc(pz.glyph || p.title.charAt(0)) + '</span>') +
          '<b>' + esc(p.title) + '</b><em>' + esc(p.tagline) + '</em></span>' +
        '<span class="ls-go mono" aria-hidden="true">cd →</span>' +
      '</a>';
    }

    return { esc: esc, projectHref: projectHref, linkHTML: linkHTML, posterHTML: posterHTML, cardHTML: cardHTML, renderProject: renderProject,
             renderLanding: renderLanding, renderDocs: renderDocs, renderDownload: renderDownload,
             lsRow: lsRow, locOf: locOf };
  }

  root.SiteRender = SiteRender;
  if (typeof module !== 'undefined' && module.exports) module.exports = SiteRender;
})(typeof window !== 'undefined' ? window : globalThis);
