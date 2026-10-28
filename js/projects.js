/* Every project on the site lives here. The home grid and the shared project page
   (projects/view.html?id=…) both read from this list.

   Fields:
     id        url-safe slug
     title     name on the card
     tagline   one line under the title
     category  desktop | web | mobile | game | freelance | trading
     year      shown on the card
     tags      tech chips
     image     card image, relative to the site root
     page      optional: a hand-built page instead of the shared template
     links     optional [{ label, href }]
     featured  optional: wide card at the top of the grid
     body      optional: paragraphs for the shared template
     features  optional: bullet points for the shared template
     gallery   optional: extra images for the shared template
*/
window.PROJECTS = [
  {
    id: 'talken',
    title: 'Talken',
    tagline: 'Serverless, peer-to-peer encrypted chat. 140,000+ lines, 705 files, two platforms.',
    category: 'desktop',
    year: '2024 – now',
    tags: ['Java 21', 'JavaFX', 'Kotlin', 'Compose', 'Spring Boot', 'Netty', 'Yggdrasil'],
    image: 'assets/img/talken-main-interface.png',
    page: 'projects/talken.html',
    featured: true,
    links: [
      { label: 'Website', href: 'https://talken.in' },
      { label: 'Download', href: 'https://talken.in/downloads.html' }
    ]
  },
  {
    id: 'notes-plus',
    title: 'Notes+',
    tagline: 'Notes without limits — Android, Windows and the web, with Backend Zero.',
    category: 'mobile',
    year: '2026',
    tags: ['Kotlin', 'Compose', 'JavaFX', 'PWA', 'Firebase', 'AES-256-GCM'],
    image: 'assets/img/notes-plus/windows-notes.webp',
    page: 'projects/notes-plus.html',
    featured: true,
    links: [
      { label: 'Website', href: 'https://notes.talken.in' },
      { label: 'GitHub', href: 'https://github.com/Shashwat-Gupta57/Notes-Plus' }
    ]
  },
  {
    id: 'sg-paint',
    title: 'SG Paint',
    tagline: 'A full-featured painting app — MS Paint, reimagined.',
    category: 'desktop',
    year: '2024',
    tags: ['Java', 'Swing'],
    image: 'assets/img/sg-paint.png',
    body: ['A desktop painting application built from scratch in Java — brushes, shapes, colours and a full tool palette, reimagining what MS Paint could be.']
  },
  {
    id: 'rex-run',
    title: 'Rex Run',
    tagline: 'My first game. An endless runner inspired by Chrome Dino and Geometry Dash.',
    category: 'game',
    year: '2023',
    tags: ['Java', 'Swing', '2D'],
    image: 'assets/img/rex-run-game.png',
    body: ['The first game I ever built, right after the terminal stopped being enough. An endless runner that borrows the simplicity of Chrome’s dinosaur and the rhythm of Geometry Dash.']
  },
  {
    id: 'notes',
    title: 'Notes',
    tagline: 'An advanced text editor that goes beyond Windows Notepad.',
    category: 'desktop',
    year: '2024',
    tags: ['Java', 'Swing'],
    image: 'assets/img/notes-app.png',
    body: ['A desktop text editor that started as a Notepad clone and kept going — the ancestor of what later became Notes+.']
  },
  {
    id: 'weather-widget',
    title: 'Weather Widget',
    tagline: 'Real-time weather in a clean desktop widget.',
    category: 'desktop',
    year: '2024',
    tags: ['Java', 'JavaFX', 'REST'],
    image: 'assets/img/weather-widget.png',
    body: ['One of four desktop widgets — live weather pulled from a public API, rendered in a small always-on-top window.']
  },
  {
    id: 'flying-dual',
    title: 'Flying Dual',
    tagline: 'A local two-player flying game.',
    category: 'game',
    year: '2024',
    tags: ['Java', 'Swing', '2D'],
    image: 'assets/img/flying-dual.png',
    body: ['Two players, one keyboard, one sky. A local multiplayer dogfight built on a hand-rolled game loop.']
  }
];

window.CATEGORIES = {
  desktop: 'Desktop',
  mobile: 'Cross-platform',
  web: 'Web',
  game: 'Games',
  freelance: 'Freelance',
  trading: 'Trading algos'
};
