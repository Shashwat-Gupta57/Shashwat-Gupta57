/* Every project on the site lives here. The home grid and the shared project page
   (projects/view.html?id=…) both read from this list, in this order.

   Fields:
     id        url-safe slug
     title     name on the card
     tagline   one line under the title
     category  key of window.CATEGORIES
     year      shown on the card
     tags      tech chips
     poster    card artwork: { from, to, ink, icon?, glyph? } — icon is an image, glyph is text
     image     optional screenshot (project page)
     page      optional: a hand-built page instead of the shared template
     status    optional badge, e.g. "private beta"
     links     optional [{ label, href }] — public things only
     stats     optional [[value, label]] for the project page
     body      optional paragraphs for the project page
     features  optional bullet points for the project page
     gallery   optional extra images for the project page
*/
window.PROJECTS = [
  /* ---------------- flagships ---------------- */
  {
    id: 'talken',
    title: 'Talken',
    tagline: 'Serverless, peer-to-peer encrypted messenger for Windows and Android.',
    category: 'talken',
    year: '2024 – now',
    status: 'beta',
    tags: ['Java 21', 'JavaFX', 'Kotlin', 'Compose', 'Netty', 'Yggdrasil'],
    poster: { from: '#5450AA', to: '#FF7A5C', ink: '#fff', glyph: 'T' },
    image: 'assets/img/talken-main-interface.png',
    page: 'projects/talken.html',
    links: [
      { label: 'Website', href: 'https://talken.in' },
      { label: 'Download', href: 'https://talken.in/downloads.html' }
    ]
  },
  {
    id: 'notes-plus',
    title: 'Notes+',
    tagline: 'Notes without limits — Android, Windows and the web, with no servers of its own.',
    category: 'cross',
    year: '2026',
    tags: ['Kotlin', 'Compose', 'JavaFX', 'PWA', 'Firebase'],
    poster: { from: '#1e1b4b', to: '#6366f1', ink: '#fff', glyph: 'N+' },
    image: 'assets/img/notes-plus/windows-notes.webp',
    page: 'projects/notes-plus.html',
    links: [
      { label: 'Website', href: 'https://notes.talken.in' },
      { label: 'GitHub', href: 'https://github.com/Shashwat-Gupta57/Notes-Plus' }
    ]
  },

  /* ---------------- cross-platform & android ---------------- */
  {
    id: 'life',
    title: 'Life',
    tagline: 'A private, shared space for the people closest to you.',
    category: 'android',
    year: '2026',
    status: 'private · going public soon',
    tags: ['Kotlin', 'Compose', 'Node.js', 'Express', 'WebSocket', 'SQLite'],
    poster: { from: '#3b0a1e', to: '#be185d', ink: '#fff', icon: 'assets/img/icons/life.png' },
    stats: [['35,000+', 'lines of Kotlin'], ['182', 'Kotlin files'], ['10+', 'connected spaces']],
    body: [
      'Life started as a private app built for two people — not a generic app, a monument. It is about to grow up: account-based, public and commercial.',
      'Behind it is my own Node.js + Express server with a SQLite database and a WebSocket protocol for live sync, deployed to my own VPS.'
    ],
    features: [
      'A real-time chat vault with read receipts, super-reactions and full-screen media',
      'Snaps — a 24-hour story strip from the built-in camera',
      'A shared journal, a nostalgia feed and a bucket list',
      'Challenges, a promise wall and announcements',
      'An outfit planner with upcoming and past looks',
      'Home-screen widgets and a lock screen'
    ]
  },
  {
    id: 'backbench',
    title: 'Backbench',
    tagline: 'A campus social platform — on the web, Android and desktop.',
    category: 'cross',
    year: '2026',
    tags: ['JavaScript', 'Vite', 'Firebase', 'Kotlin'],
    poster: { from: '#0c1a2e', to: '#2563eb', ink: '#fff', icon: 'assets/img/icons/backbench.png' },
    stats: [['13,600+', 'lines of code'], ['61', 'commits'], ['3', 'platforms']],
    links: [{ label: 'GitHub', href: 'https://github.com/Shashwat-Gupta57/Backbench' }],
    body: [
      'Backbench is a social network built for a single campus: everything students actually do together, in one place. A Vite web app on Firebase, wrapped for Android and desktop.'
    ],
    features: [
      'Posts, friends, profiles and direct messages',
      'Clubs, events and announcements',
      'Polls and petitions',
      'Search and notifications',
      'An admin console for moderation'
    ]
  },
  {
    id: 'expenses',
    title: 'Expenses',
    tagline: 'Split trip costs with friends, and settle up without the maths.',
    category: 'android',
    year: '2026',
    tags: ['Java', 'Android', 'Google Sign-In'],
    poster: { from: '#052e16', to: '#16a34a', ink: '#fff', icon: 'assets/img/icons/expenses.png' },
    stats: [['3,800+', 'lines of Java'], ['33', 'source files']],
    body: ['A native Android app for group trips: create a trip, add members, log who paid for what, and let the app work out who owes whom.'],
    features: [
      'Trips with members, dates and descriptions',
      'Expenses with custom splits, icons and comments',
      'Live balances, totals and charts',
      'Settle up and record money transfers',
      'Google sign-in and usernames'
    ]
  },

  /* ---------------- dev tools & web ---------------- */
  {
    id: 'jctx',
    title: 'Jctx',
    tagline: 'Give AI full understanding of your Java, Kotlin & Python codebase.',
    category: 'tools',
    year: '2026',
    tags: ['Python', 'CLI'],
    poster: { from: '#111827', to: '#f59e0b', ink: '#fff', glyph: '{ }' },
    image: 'assets/img/jctx.gif',
    stats: [['6★', 'on GitHub'], ['4,600+', 'lines of Python'], ['0', 'dependencies']],
    links: [{ label: 'GitHub', href: 'https://github.com/Shashwat-Gupta57/Jctx' }],
    body: [
      'Stop pasting files. Jctx turns any Java, Kotlin or Python project into a single AI-ready context.txt (or context.md) in seconds — so the AI answers with the whole architecture in mind.',
      'No config, no dependencies: just Python and a folder.'
    ],
    features: [
      'One command: Jctx "C:\\projects\\MyApp"',
      'Understands Java, Kotlin, Python, Maven and Gradle projects',
      'Plain-text or Markdown output'
    ]
  },
  {
    id: 'codemeter',
    title: 'CodeMeter',
    tagline: 'Measure your code. Physically. How many Burj Khalifas tall is your codebase?',
    category: 'tools',
    year: '2026',
    tags: ['Java', 'CLI', 'GraalVM'],
    poster: { from: '#0f172a', to: '#14b8a6', ink: '#fff', glyph: '📏' },
    stats: [['5,100+', 'lines of Java'], ['29', 'commits'], ['6', 'export formats']],
    links: [{ label: 'GitHub', href: 'https://github.com/Shashwat-Gupta57/CodeMeter' }],
    body: ['A fast, editorial-grade CLI that doesn’t just count your lines of code — it tells you what they mean in the real world: meters, kilograms, Eiffel Towers, trees.'],
    features: [
      'Powered by scc and cloc for lightning-fast analysis',
      'Achievements and ranks that gamify your codebase',
      'History tracking to watch a project grow',
      'PDF, SVG, PNG, JSON, CSV and Markdown reports',
      'A native GraalVM executable — instant start, no JVM required'
    ]
  },
  {
    id: 'nglobe',
    title: 'NGlobe',
    tagline: 'Your machine’s network traffic, live, on a 3D globe.',
    category: 'tools',
    year: '2026',
    tags: ['Python', 'FastAPI', 'mitmproxy', 'React', 'Deck.gl'],
    poster: { from: '#020617', to: '#0891b2', ink: '#fff', glyph: '🌐' },
    stats: [['14,000+', 'lines of code'], ['60fps', '3D rendering']],
    links: [{ label: 'GitHub', href: 'https://github.com/Shashwat-Gupta57/NGlobe' }],
    body: ['Tools like Wireshark show traffic as endless rows of text. NGlobe intercepts your local traffic and maps every request geographically in real time — packets fly across the globe like lasers.'],
    features: [
      'Interactive 3D globe on Deck.gl and MapLibre',
      'Every request becomes a particle flying to its server',
      'HTTP and decrypted HTTPS capture through mitmproxy',
      'IPs, ASNs, hostnames and transfer volumes in a live sidebar',
      'Zero-config: one command sets up certificates, proxy and GeoIP'
    ]
  },
  {
    id: 'workdesk',
    title: 'WorkDesk',
    tagline: 'A workspace where every file is an artifact with an unbreakable history.',
    category: 'web',
    year: '2026',
    tags: ['Next.js', 'TypeScript', 'PostgreSQL', 'Tailwind'],
    poster: { from: '#18181b', to: '#a855f7', ink: '#fff', glyph: '▦' },
    stats: [['10,700+', 'lines of TypeScript'], ['3', 'database-enforced invariants']],
    links: [{ label: 'GitHub', href: 'https://github.com/Shashwat-Gupta57/WorkDesk' }],
    body: [
      'WorkDesk treats every piece of work as a first-class artifact. Sharing passes a reference, never a copy, and every version is append-only — enforced by the database itself, not just the code.'
    ],
    features: [
      'Hand-rolled authentication with bcrypt sessions',
      'An archive explorer with set trees, grid and list views',
      'An artifact editor with auto-save, commit and restore',
      'Append-only versioning guarded by PostgreSQL triggers'
    ]
  },

  /* ---------------- talken ecosystem ---------------- */
  {
    id: 'talken-rest-api',
    title: 'Talken REST API',
    tagline: 'The phone book and post office behind Talken — never a vault.',
    category: 'talken',
    year: '2025 – now',
    tags: ['Java 21', 'Spring Boot', 'MapDB'],
    poster: { from: '#26234a', to: '#5450AA', ink: '#fff', glyph: 'API' },
    stats: [['11,600+', 'lines of Java'], ['90', 'source files']],
    body: ['Talken’s only central piece, written from scratch in Spring Boot. It lets people find each other, recover their key with their password, and holds messages for friends who are offline. It never routes a live conversation.'],
    features: ['User discovery', 'Account-key recovery', 'Offline message delivery — up to 1,000 messages, kept 3 years', 'Ships its own client library for the apps']
  },
  {
    id: 'talken-ddb',
    title: 'Talken DDB',
    tagline: 'A distributed database over the Talken peer network.',
    category: 'talken',
    year: '2026',
    status: 'in development',
    tags: ['Java', 'Kademlia DHT', 'P2P'],
    poster: { from: '#1a1a2e', to: '#e94560', ink: '#fff', glyph: 'DDB' },
    stats: [['27,000+', 'lines of Java'], ['169', 'source files']],
    body: ['A mutable Kademlia DHT with a database-shaped interface on top: you talk to it like a normal database, and underneath it reads and writes a distributed hash table spread across Talken devices. Its first real consumer will be public channels.']
  },
  {
    id: 'drive-handler',
    title: 'Drive Handler',
    tagline: 'The Google Drive library that lets Talken keep your files in your own storage.',
    category: 'talken',
    year: '2025',
    tags: ['Java', 'Kotlin', 'Gradle', 'Google Drive API'],
    poster: { from: '#0f2a1d', to: '#22c55e', ink: '#fff', glyph: '⇅' },
    stats: [['4,100+', 'lines of code'], ['2', 'platforms']],
    body: ['A standalone library for desktop and Android that handles sign-in, uploads, downloads and sharing on the user’s own Google Drive — the reason Talken can send multi-gigabyte files without a file server.']
  },
  {
    id: 'talken-toolkit',
    title: 'Talken Toolkit',
    tagline: 'Talken’s companion updater — check, download, install.',
    category: 'talken',
    year: '2025',
    tags: ['Java', 'JavaFX'],
    poster: { from: '#2a1f3d', to: '#8580C8', ink: '#fff', glyph: '↻' },
    body: ['A small JavaFX utility that checks for the latest Talken version and downloads new builds into your Talken directory.']
  },

  /* ---------------- desktop apps ---------------- */
  {
    id: 'sg-paint',
    title: 'SG Paint',
    tagline: 'A full-featured painting app — MS Paint, reimagined.',
    category: 'desktop',
    year: '2024',
    tags: ['Java', 'Swing'],
    poster: { from: '#1f2937', to: '#ef4444', ink: '#fff', glyph: '🎨' },
    image: 'assets/img/sg-paint.png',
    stats: [['3,500+', 'lines of Java']],
    body: ['A desktop painting application built from scratch in Java — brushes, shapes, colours and a full tool palette, reimagining what MS Paint could be.'],
    features: ['Brushes, shapes and an eraser', 'A built-in colour picker', 'Open, save and create new canvases', 'Resize images']
  },
  {
    id: 'photos-utility',
    title: 'Photos Utility',
    tagline: 'A fast desktop gallery for folders of photos and videos.',
    category: 'desktop',
    year: '2026',
    tags: ['Java', 'JavaFX', 'VLC'],
    poster: { from: '#0b1324', to: '#38bdf8', ink: '#fff', icon: 'assets/img/icons/photos.jpg' },
    stats: [['2,100+', 'lines of Java']],
    body: ['Point it at any folder and browse every photo and video inside, with real thumbnails — the way a phone gallery feels, on Windows.'],
    features: ['Folder and media tiles with Windows-native thumbnails', 'Video thumbnails and playback through VLC', 'A full-screen media viewer', 'Recent folders']
  },
  {
    id: 'notes',
    title: 'Notes',
    tagline: 'An advanced text editor that goes beyond Windows Notepad.',
    category: 'desktop',
    year: '2024',
    tags: ['Java', 'Swing'],
    poster: { from: '#292524', to: '#eab308', ink: '#fff', glyph: '✎' },
    image: 'assets/img/notes-app.png',
    stats: [['2,500+', 'lines of Java']],
    body: ['A desktop text editor that started as a Notepad clone and kept going — the ancestor of what later became Notes+.'],
    features: ['Per-file and universal text and background colours', 'Fonts and styles', 'Automatic backups to a folder you choose', 'File encryption and decryption']
  },
  {
    id: 'color-picker',
    title: 'Color Picker',
    tagline: 'Pick any colour, copy it as RGB, HEX or HSB.',
    category: 'desktop',
    year: '2024',
    tags: ['Java', 'Swing', 'JavaFX'],
    poster: { from: '#7c3aed', to: '#f97316', ink: '#fff', glyph: '◐' },
    body: ['A tiny utility I built twice: first in Swing, then rebuilt from scratch in JavaFX. Pick a colour and copy its RGB, HEX or HSB code in one click.']
  },
  {
    id: 'floating-keyboard',
    title: 'Floating Keyboard',
    tagline: 'An on-screen keyboard that floats above everything.',
    category: 'desktop',
    year: '2024',
    tags: ['Java', 'Swing'],
    poster: { from: '#111827', to: '#64748b', ink: '#fff', icon: 'assets/img/icons/keyboard.jpg' },
    body: ['A floating, always-on-top virtual keyboard for typing without a physical one.']
  },
  {
    id: 'jre-installer',
    title: 'JRE Installer',
    tagline: 'One click to make any Windows PC ready for my Java apps.',
    category: 'desktop',
    year: '2024',
    tags: ['Java', 'Swing', 'Windows'],
    poster: { from: '#1c1917', to: '#f97316', ink: '#fff', glyph: '☕' },
    body: ['Sharing Java apps with friends meant first explaining Java. So I wrote an installer that sets up a Java runtime on Windows with a single button — no admin rights needed.']
  },
  {
    id: 'memo',
    title: 'Memo',
    tagline: 'A quick, lightweight memo pad for the desktop.',
    category: 'desktop',
    year: '2024',
    tags: ['Java', 'Swing'],
    poster: { from: '#422006', to: '#facc15', ink: '#fff', icon: 'assets/img/icons/memo.png' },
    body: ['A small desktop memo app for jotting things down fast.']
  },
  {
    id: 'cps-tester',
    title: 'CPS Tester',
    tagline: 'How fast can you click? My very first GUI app.',
    category: 'desktop',
    year: '2023',
    tags: ['Java', 'Swing'],
    poster: { from: '#18181b', to: '#22d3ee', ink: '#fff', icon: 'assets/img/icons/cps.png' },
    body: ['The first app I ever built with a window instead of a terminal: a clicks-per-second test with a countdown, a score and a restart button.']
  },

  /* ---------------- widgets ---------------- */
  {
    id: 'weather-widget',
    title: 'Weather Widget',
    tagline: 'Live weather in a clean, translucent desktop widget.',
    category: 'widget',
    year: '2024',
    tags: ['Java', 'Swing', 'REST'],
    poster: { from: '#1e3a8a', to: '#60a5fa', ink: '#fff', glyph: '☀' },
    image: 'assets/img/weather-widget.png',
    body: ['Real-time weather pulled from a public weather API, rendered in a small rounded, translucent window that lives on the desktop.']
  },
  {
    id: 'clock-widget',
    title: 'Clock Widget',
    tagline: 'A transparent desktop clock you can recolour, move and resize.',
    category: 'widget',
    year: '2024',
    tags: ['Java', 'Swing', 'JavaFX'],
    poster: { from: '#0a0a0a', to: '#525252', ink: '#fff', icon: 'assets/img/icons/clock.jpg' },
    body: ['A clock that floats on the desktop with no window around it. Rebuilt with a control panel to change its colour, move it and resize it, plus 24-hour and JavaFX versions.']
  },
  {
    id: 'mix-widget',
    title: 'MixWidget',
    tagline: 'Clock and weather, together in one translucent widget.',
    category: 'widget',
    year: '2024',
    tags: ['Java', 'Swing', 'REST'],
    poster: { from: '#0c4a6e', to: '#fbbf24', ink: '#fff', icon: 'assets/img/icons/mix.png' },
    body: ['The clock and weather widgets merged into one: time, date and live conditions with their own weather art, on a see-through panel.']
  },

  /* ---------------- games ---------------- */
  {
    id: 'rex-run',
    title: 'Rex Run',
    tagline: 'My first game. An endless runner inspired by Chrome Dino and Geometry Dash.',
    category: 'game',
    year: '2024',
    tags: ['Java', 'Swing', '2D'],
    poster: { from: '#3f3f46', to: '#facc15', ink: '#fff', glyph: '🦖' },
    image: 'assets/img/rex-run-game.png',
    stats: [['6,300+', 'lines of Java']],
    body: ['The first game I ever built, right after the terminal stopped being enough. An endless runner that borrows the simplicity of Chrome’s dinosaur and the rhythm of Geometry Dash.'],
    features: ['Coins, lives and jump pillars', 'A shop and avatar editor', 'Saved progress and settings', 'Pause, resume and restart']
  },
  {
    id: 'flying-dual',
    title: 'Flying Dual',
    tagline: 'A local two-player dogfight on one keyboard.',
    category: 'game',
    year: '2024',
    tags: ['Java', 'Swing', '2D'],
    poster: { from: '#052e16', to: '#dc2626', ink: '#fff', glyph: '✈' },
    image: 'assets/img/flying-dual.png',
    body: ['Two players, one keyboard, one sky. A local multiplayer shooter on a hand-rolled game loop, with difficulty levels and a round timer.']
  },
  {
    id: 'ping-pong',
    title: 'Ping Pong',
    tagline: 'Two-player pong with your own colours.',
    category: 'game',
    year: '2024',
    tags: ['Java', 'Swing', '2D'],
    poster: { from: '#0f172a', to: '#06b6d4', ink: '#fff', icon: 'assets/img/icons/pingpong.png' },
    body: ['Classic two-player pong — with a settings screen to recolour the ball, both paddles and the background.']
  },
  {
    id: 'flappy-bird',
    title: 'Flappy Bird',
    tagline: 'Tap, flap, don’t touch the pipes.',
    category: 'game',
    year: '2024',
    tags: ['Java', 'Swing', '2D'],
    poster: { from: '#065f46', to: '#38bdf8', ink: '#fff', icon: 'assets/img/icons/flappy.png' },
    body: ['My take on the one-button classic, built from scratch in Swing with my own physics and pipe generator.']
  },
  {
    id: 'tic-tac-toe',
    title: 'Tic Tac Toe',
    tagline: 'The classic, with a running scoreboard.',
    category: 'game',
    year: '2024',
    tags: ['Java', 'Swing'],
    poster: { from: '#312e81', to: '#f472b6', ink: '#fff', icon: 'assets/img/icons/tictactoe.png' },
    body: ['Two-player tic-tac-toe with a scoreboard that keeps count across rounds.']
  },
  {
    id: 'terminal-game',
    title: 'Terminal Game',
    tagline: 'The 3,279-line program that made me fall for code.',
    category: 'game',
    year: '2023',
    tags: ['Java', 'Terminal'],
    poster: { from: '#0a0a0b', to: '#ff6a3d', ink: '#fff', glyph: '(^_^)' },
    links: [{ label: 'Play it', href: 'index.html#walker', internal: true }],
    stats: [['3,279', 'lines'], ['Nov 2023', 'written']],
    body: [
      'Until my 9th-grade half-yearlies I thought coding was pointless. Then I wondered whether I could make a character move across a terminal from user input — and this happened.',
      'A title screen, a settings menu with animation speed and loading-screen options, a loading bar, a gamer tag, a pause screen and secret hash-codes — and a (^_^) who falls from the sky and walks wherever you tell him. The walker at the top of this site is drawn from its original sprites.'
    ]
  }
];

window.CATEGORIES = {
  talken: 'Talken ecosystem',
  cross: 'Cross-platform',
  android: 'Android',
  tools: 'Dev tools',
  web: 'Web',
  desktop: 'Desktop apps',
  widget: 'Widgets',
  game: 'Games',
  freelance: 'Freelance',
  trading: 'Trading algos'
};
