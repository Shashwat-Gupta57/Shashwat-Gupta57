/* Generates a static page for every project: projects/<id>.html
   Each page carries its full content in the HTML itself (no injection at load), its own title,
   description and social preview — so it can be linked from the project's GitHub repo.

   Run after editing js/projects.js:   node tools/build-pages.js
   (the Pages deploy runs it too, so the site never drifts from the data) */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
global.window = {};
require(path.join(ROOT, 'js', 'projects.js'));
const SiteRender = require(path.join(ROOT, 'js', 'render.js'));
const { PROJECTS, CATEGORIES } = global.window;
const R = SiteRender('../', PROJECTS, CATEGORIES);

const esc = R.esc;
const SITE = 'https://dev.talken.in/';

const shell = (p, body) => {
  const pz = p.poster || {};
  const img = (p.shots && p.shots[0] && p.shots[0].src) || pz.icon || 'assets/img/developer.jpg';
  const desc = `${p.title} — ${p.tagline} A project by Shashwat Gupta.`;
  const accent = pz.to ? ` style="--accent:${esc(pz.to)};--accent-soft:color-mix(in srgb, ${esc(pz.to)} 14%, transparent)"` : '';
  return `<!DOCTYPE html>
<html lang="en" class="no-js" data-base="../">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${esc(p.title)} — Shashwat Gupta</title>
  <meta name="description" content="${esc(desc)}" />
  <link rel="canonical" href="${SITE}projects/${p.id}.html" />
  <meta property="og:type" content="website" />
  <meta property="og:title" content="${esc(p.title)} — Shashwat Gupta" />
  <meta property="og:description" content="${esc(p.tagline)}" />
  <meta property="og:url" content="${SITE}projects/${p.id}.html" />
  <meta property="og:image" content="${SITE}${esc(img)}" />
  <meta name="theme-color" content="#0c0c0e" />
  <link rel="icon" href="../assets/favicon.svg" type="image/svg+xml" />
  <script>document.documentElement.classList.remove("no-js");(function(){try{var t=localStorage.getItem('sg-theme');if(t)document.documentElement.setAttribute('data-theme',t);}catch(e){}})();</script>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="../css/style.css?v=dev" />
</head>
<body class="pv-site"${accent}>
  <a class="skip" href="#main">Skip to content</a>

  <header class="nav" id="nav">
    <div class="wrap nav-inner">
      <a class="brand" href="../index.html" aria-label="Shashwat Gupta, home">
        <span class="brand-mark">SG</span>
        <span class="brand-name">shashwat<span class="dim">.gupta</span></span>
      </a>
      <nav class="nav-links" aria-label="Primary">
        <a href="../index.html#work">All projects</a>
        <a href="../index.html#contact">Contact</a>
      </nav>
      <button class="theme-btn" id="themeBtn" aria-label="Toggle colour theme">
        <svg class="i-sun" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>
        <svg class="i-moon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z"/></svg>
      </button>
    </div>
  </header>

  <main id="main">
    <div id="pview" data-project="${esc(p.id)}">${body}</div>
  </main>

  <footer class="foot">
    <div class="wrap foot-inner mono">
      <span>© <span id="year">2026</span> Shashwat Gupta · Flex Studios</span>
      <a href="../index.html">← back to the portfolio</a>
      <a href="#main">back to top ↑</a>
    </div>
  </footer>

  <script src="../js/projects.js?v=dev"></script>
  <script src="../js/render.js?v=dev"></script>
  <script src="../js/paths.js?v=dev" defer></script>
  <script src="../js/main.js?v=dev" defer></script>
</body>
</html>
`;
};

let n = 0;
for (const p of PROJECTS) {
  if (p.page) continue; // Talken and Notes+ have hand-built pages
  fs.writeFileSync(path.join(ROOT, 'projects', `${p.id}.html`), shell(p, R.renderProject(p)));
  n++;
}

// old links (projects/view.html?id=…) forward to the static page
fs.writeFileSync(path.join(ROOT, 'projects', 'view.html'), `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8" /><title>Redirecting…</title><meta name="robots" content="noindex" />
<script>var id=new URLSearchParams(location.search).get('id');location.replace(id?id.replace(/[^a-z0-9-]/g,'')+'.html':'../index.html#work');</script>
</head><body><a href="../index.html#work">All projects</a></body></html>
`);
console.log(`generated ${n} project pages`);
