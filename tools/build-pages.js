/* Generates a small website for every project:

     projects/<id>/index.html     — landing page
     projects/<id>/docs.html      — documentation
     projects/<id>/download.html  — releases, checksums, install

   Every page carries its full content in the HTML itself, with its own title, description and
   social preview, so each can be linked from the project's GitHub repo. Data comes from
   js/projects.js, js/docs.js, js/structure.js and js/releases.js.

   Run after editing the data:   node tools/build-pages.js
   (the Pages deploy runs it too, so the site never drifts from the data) */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
global.window = {};
for (const f of ['projects.js', 'docs.js', 'structure.js', 'releases.js']) {
  const p = path.join(ROOT, 'js', f);
  if (fs.existsSync(p)) require(p);
}
const SiteRender = require(path.join(ROOT, 'js', 'render.js'));
const { PROJECTS, CATEGORIES, DOCS, STRUCTURE, RELEASES } = global.window;
const R = SiteRender('../../', PROJECTS, CATEGORIES, DOCS, STRUCTURE, RELEASES);
const esc = R.esc;
const SITE = 'https://dev.talken.in/';

const PAGES = [
  { file: 'index.html', render: R.renderLanding, title: (p) => `${p.title} — ${p.tagline}`, desc: (p) => `${p.title}: ${p.tagline} A project by Shashwat Gupta.` },
  { file: 'docs.html', render: R.renderDocs, title: (p) => `${p.title} Docs`, desc: (p) => `Documentation for ${p.title}: getting started, controls, configuration, project structure and FAQ.` },
  { file: 'download.html', render: R.renderDownload, title: (p) => `Download ${p.title}`, desc: (p) => `Download ${p.title} — latest release, checksums and install steps.` },
];

const shell = (p, page, body) => {
  const pz = p.poster || {};
  const img = (p.shots && p.shots[0] && p.shots[0].src) || pz.icon || 'assets/img/developer.jpg';
  const url = `${SITE}projects/${p.id}/${page.file === 'index.html' ? '' : page.file}`;
  const accent = pz.to ? ` style="--accent:${esc(pz.to)};--accent-soft:color-mix(in srgb, ${esc(pz.to)} 14%, transparent)"` : '';
  return `<!DOCTYPE html>
<html lang="en" class="no-js" data-base="../../">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${esc(page.title(p))}</title>
  <meta name="description" content="${esc(page.desc(p))}" />
  <link rel="canonical" href="${url}" />
  <meta property="og:type" content="website" />
  <meta property="og:title" content="${esc(page.title(p))}" />
  <meta property="og:description" content="${esc(p.tagline)}" />
  <meta property="og:url" content="${url}" />
  <meta property="og:image" content="${SITE}${esc(img)}" />
  <meta name="theme-color" content="#0c0c0e" />
  <link rel="icon" href="../../${esc(pz.icon && !pz.icon.endsWith('.svg') ? pz.icon : 'assets/favicon.svg')}" />
  <script>document.documentElement.classList.remove("no-js");(function(){try{var t=localStorage.getItem('sg-theme');if(t)document.documentElement.setAttribute('data-theme',t);}catch(e){}})();</script>
  <link rel="stylesheet" href="../../assets/fonts/fonts.css" />
  <link rel="stylesheet" href="../../css/style.css?v=dev" />
</head>
<body class="pv-site ms-site"${accent}>
  <a class="skip" href="#main">Skip to content</a>
  ${body}
  <footer class="foot">
    <div class="wrap foot-inner mono">
      <span>${esc(p.title)} · © <span id="year">2026</span> Shashwat Gupta · Flex Studios</span>
      <span class="ms-foot-links"><a href="index.html">Overview</a> · <a href="docs.html">Docs</a> · <a href="download.html">Download</a></span>
      <a href="../../work.html">← all projects</a>
    </div>
  </footer>

  <script src="../../js/projects.js?v=dev"></script>
  <script src="../../js/render.js?v=dev"></script>
  <script src="../../js/paths.js?v=dev" defer></script>
  <script src="../../js/main.js?v=dev" defer></script>
  <script src="../../js/gate.js?v=dev" defer></script>
</body>
</html>
`;
};

const redirect = (to) => `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8" /><title>Redirecting…</title><meta name="robots" content="noindex" />
<link rel="canonical" href="${to}" /><meta http-equiv="refresh" content="0; url=${to}" />
<script>location.replace(${JSON.stringify(to)} + location.hash);</script>
</head><body><a href="${to}">Continue</a></body></html>
`;

let n = 0;
for (const p of PROJECTS) {
  if (p.page) continue; // Talken and Notes+ have hand-built pages
  const dir = path.join(ROOT, 'projects', p.id);
  fs.mkdirSync(dir, { recursive: true });
  for (const page of PAGES) {
    fs.writeFileSync(path.join(dir, page.file), shell(p, page, page.render(p)));
    n++;
  }
  // the old one-page URL forwards to the new site
  fs.writeFileSync(path.join(ROOT, 'projects', `${p.id}.html`), redirect(`${p.id}/`));
}

// old links (projects/view.html?id=…) forward to the project's site
fs.writeFileSync(path.join(ROOT, 'projects', 'view.html'), `<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8" /><title>Redirecting…</title><meta name="robots" content="noindex" />
<script>var id=new URLSearchParams(location.search).get('id');location.replace(id?id.replace(/[^a-z0-9-]/g,'')+'/':'../index.html#work');</script>
</head><body><a href="../index.html#work">All projects</a></body></html>
`);
console.log(`generated ${n} pages for ${n / PAGES.length} project sites`);
