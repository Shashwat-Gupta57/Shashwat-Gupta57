/* Runs in <head>, before the page paints: decides whether this visit to this page gets the build
   (js/build.js). Each page builds itself once per browser session; ?tour (the nav's Tour button)
   forces it, ?build=off and reduced motion skip it. If the page is to be built it's hidden now
   (html.sw-on, see style.css) and, should the builder never show up, shown again after 8 seconds. */
(function () {
  try {
    var q = location.search, force = /[?&](tour|build=1)\b/.test(q);
    if (/[?&]build=off\b/.test(q)) return;
    if (!force && (sessionStorage.getItem('sg-built:' + location.pathname.replace(/index\.html$/, '')) ||
        matchMedia('(prefers-reduced-motion: reduce)').matches)) return;
    var r = document.documentElement;
    r.classList.add('sw-on');
    setTimeout(function () { var b = window.SGBuild; if (!b || !(b.running || b.pending)) r.classList.remove('sw-on'); }, 8000);
  } catch (e) { /* storage blocked: just show the page */ }
})();
