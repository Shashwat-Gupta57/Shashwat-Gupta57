/* HTML builders shared by the browser (js/main.js) and the static page generator
   (tools/build-pages.js). Pure string functions: no DOM, so they run in Node too.

   Usage: var R = SiteRender(base, projects, categories);
          R.cardHTML(p), R.renderProject(p), R.projectHref(p) …            */
(function (root) {
  'use strict';

  function SiteRender(BASE, PROJECTS, CATS) {
    BASE = BASE || '';
    CATS = CATS || {};

    function esc(s) {
      return String(s).replace(/[&<>"']/g, function (c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
      });
    }
    // every project has its own static page: projects/<id>.html
    function projectHref(p) { return BASE + (p.page || 'projects/' + p.id + '.html'); }
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

    return { esc: esc, projectHref: projectHref, linkHTML: linkHTML, posterHTML: posterHTML, cardHTML: cardHTML, renderProject: renderProject };
  }

  root.SiteRender = SiteRender;
  if (typeof module !== 'undefined' && module.exports) module.exports = SiteRender;
})(typeof window !== 'undefined' ? window : globalThis);
