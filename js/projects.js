/* Every project on the site lives here. The home grid and each project's own page
   (projects/view.html?id=…) both read from this list, in this order.

   Card fields:
     id, title, tagline, category (key of window.CATEGORIES), year, tags, status?
     poster    { from, to, ink, icon?, glyph?, bare?, pixel? } — icon is the app's logo
               (bare: no tile behind it; pixel: crisp upscaling), glyph is text when there's no logo
     page      optional: a hand-built page instead of the shared template
     links     optional [{ label, href, internal? }] — public things only

   Project-page fields (all optional; each renders its own section):
     stats      [[value, label]]
     shots      [{ src, caption }] — real screenshots, first one is the hero
     story      paragraphs — the why and the how
     highlights [{ t, d }] — what it does
     install    [{ label, code }] — one tab per package manager
     commands   [{ cmd, d }]
     terminal   { title, cmd, out } — real console output
     api        [{ group, intro?, items: [{ sig, d }] }] — reference docs for libraries
     build      [[label, value]] — under the hood
*/
var S = 'assets/img/shots/';

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
    poster: { from: '#5450AA', to: '#FF7A5C', ink: '#fff', icon: 'assets/img/icons/talken.png' },
    page: 'projects/talken.html',
    cover: 'assets/img/talken-main-interface.png',
    stats: [['140,000+', 'lines of code'], ['705', 'source files'], ['0', 'servers that see a live message']],
    blurb: 'No message server, no phone number, no middleman. Messages travel device to device over an encrypted mesh, files stay in your own Drive, and your account is a key only you hold. I built every layer of it myself — the wire protocol, the calling stack, the offline mailbox and the backend.',
    links: [
      { label: 'Website', href: 'https://talken.in' },
      { label: 'Download', href: 'https://talken.in/downloads.html' }
    ]
  },
  {
    id: 'notes-plus',
    title: 'Notes+',
    tagline: 'Backend Zero: a notes ecosystem with no servers — and hidden encrypted vaults underneath.',
    category: 'cross',
    year: '2026',
    tags: ['Java', 'Android', 'JavaFX', 'PWA', 'Firebase'],
    poster: { from: '#1e1b4b', to: '#6366f1', ink: '#fff', icon: 'assets/img/icons/notesplus.png' },
    page: 'projects/notes-plus.html',
    cover: 'assets/img/notes-plus/windows-notes.webp',
    stats: [['0', 'servers of its own'], ['3', 'apps, one account'], ['65,000+', 'lines']],
    blurb: 'What my old Notes app grew into. Android, Windows and the web on one account, with Backend Zero — no servers of its own — and two hidden, encrypted vaults beneath a perfectly ordinary notes app.',
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
    stats: [['35,000+', 'lines of Kotlin'], ['182', 'Kotlin files'], ['10+', 'connected spaces'], ['1', 'server of my own']],
    story: [
      'Most social apps are built for everyone you have ever met. Life is built for the few people who actually matter — a single, warm, private place to share a day, plan the future and remember the past.',
      'It started as a private app made for two people: not a generic app, but a monument. It is now growing up — account-based, public and commercial — without losing that intimacy.',
      'Every space is a screen you swipe between, and everything syncs live. Behind it is my own Node.js and Express server with a SQLite database and a WebSocket protocol for real-time sync, deployed to my own VPS with a one-command deploy script.'
    ],
    highlights: [
      { t: 'The vault', d: 'A real-time chat with read receipts, super-reactions, unread dividers and full-screen photo and video viewing.' },
      { t: 'Snaps', d: 'A 24-hour story strip shot straight from the built-in camera.' },
      { t: 'Journal & nostalgia', d: 'Write the day down together, and get yesterday handed back to you in a nostalgia feed.' },
      { t: 'Bucket list', d: 'Every plan you’ve ever made together, in one place, ready to be ticked off.' },
      { t: 'Challenges & promise wall', d: 'A ledger of dares and the promises you keep to each other.' },
      { t: 'Wardrobe', d: 'Plan outfits ahead and look back at past looks.' },
      { t: 'Announcements', d: 'Short one-liners for the big news and the small.' },
      { t: 'Widgets & lock', d: 'Home-screen widgets keep it close; a lock screen keeps it private.' }
    ],
    build: [['App', 'Kotlin · Jetpack Compose · a pager of spaces with sliding overlays'], ['Sync', 'Own WebSocket protocol for live updates'], ['Server', 'Node.js · Express · SQLite (better-sqlite3)'], ['Hosting', 'My own VPS behind nginx, one-command deploy'], ['Variants', 'Compile-time product flavours']]
  },
  {
    id: 'backbench',
    title: 'Backbench',
    tagline: 'A campus social platform — on the web, Android and desktop.',
    category: 'cross',
    year: '2026',
    tags: ['JavaScript', 'Vite', 'Firebase', 'Kotlin'],
    poster: { from: '#0c1a2e', to: '#2563eb', ink: '#fff', icon: 'assets/img/icons/backbench.png' },
    stats: [['13,600+', 'lines of code'], ['61', 'commits in 9 days'], ['3', 'platforms'], ['15', 'feature modules']],
    links: [{ label: 'GitHub', href: 'https://github.com/Shashwat-Gupta57/Backbench' }],
    story: [
      'Every college runs on a dozen group chats, a notice board nobody reads and word of mouth. Backbench puts all of it in one place: a social network built for a single campus, where the people around you are the only people on it.',
      'It is a Vite web app on Firebase, wrapped natively for Android and for the desktop — sixty-one commits in nine days, from an empty folder to three platforms.'
    ],
    highlights: [
      { t: 'Posts & profiles', d: 'A home feed, rich profiles and friends — the social core, scoped to campus.' },
      { t: 'Messages', d: 'Direct messages between students.' },
      { t: 'Clubs', d: 'Every society gets a home, with its members and its updates.' },
      { t: 'Events', d: 'What’s happening, when and where — in one calendar everyone sees.' },
      { t: 'Polls & petitions', d: 'Ask the campus a question, or gather signatures for something that matters.' },
      { t: 'Announcements', d: 'Official notices that actually reach people.' },
      { t: 'Search & notifications', d: 'Find anyone or anything; never miss what concerns you.' },
      { t: 'Admin console', d: 'Moderation tools to keep it a place people want to be.' }
    ],
    build: [['Web', 'Vanilla JavaScript modules, built with Vite'], ['Backend', 'Firebase, guarded by database rules'], ['Android', 'Native Kotlin wrapper'], ['Desktop', 'Packaged desktop app']]
  },
  {
    id: 'expenses',
    title: 'Expenses',
    tagline: 'Split trip costs with friends, and settle up without the maths.',
    category: 'android',
    year: '2026',
    tags: ['Java', 'Android', 'Google Sign-In'],
    poster: { from: '#052e16', to: '#16a34a', ink: '#fff', icon: 'assets/img/icons/expenses.png' },
    stats: [['3,800+', 'lines of Java'], ['33', 'source files'], ['19', 'screens']],
    story: [
      'Every trip ends the same way: a long chat full of "who paid for the cab?" Expenses ends that argument. Create a trip, add the people on it, log what each of them paid, and the app works out exactly who owes whom.',
      'A native Android app in Java with Google sign-in, a screen for every step of a trip, and charts for where the money actually went.'
    ],
    highlights: [
      { t: 'Trips', d: 'Create a trip with its members, dates and description; edit any of them later.' },
      { t: 'Custom splits', d: 'Split a bill equally or exactly — per person, per expense, with an icon and comments.' },
      { t: 'Live balances', d: 'Running totals and per-person balances update as you add expenses.' },
      { t: 'Settle up', d: 'Record money transfers between members and watch the debts close.' },
      { t: 'Charts', d: 'See where the money went across the whole trip.' },
      { t: 'Accounts', d: 'Google sign-in and unique usernames.' }
    ],
    build: [['Platform', 'Native Android, Java'], ['Sign-in', 'Google Sign-In'], ['Screens', 'Trip dashboard, add expense, balances, totals, charts, settle up, transfers']]
  },

  /* ---------------- dev tools & web ---------------- */
  {
    id: 'jctx',
    title: 'Jctx',
    tagline: 'Give AI full understanding of your Java, Kotlin & Python codebase.',
    category: 'tools',
    year: '2026',
    tags: ['Python', 'CLI', 'PyPI'],
    poster: { from: '#111827', to: '#f59e0b', ink: '#fff', glyph: '{ }' },
    stats: [['6★', 'on GitHub'], ['4,600+', 'lines of Python'], ['3', 'languages understood'], ['0', 'dependencies']],
    links: [{ label: 'GitHub', href: 'https://github.com/Shashwat-Gupta57/Jctx' }, { label: 'PyPI', href: 'https://pypi.org/project/jctx/' }],
    shots: [{ src: 'assets/img/jctx.gif', caption: 'One command, one context file' }],
    story: [
      'You open an AI chat to get help with your project, and before you can even ask the question you spend ten minutes pasting files and explaining your class structure. Then the AI suggests a class that doesn’t exist.',
      'Jctx does all of that in one command. It scans the project and writes a clean, structured context.txt — every class, every field, every method signature, every Javadoc, KDoc and docstring, and your build files — then prints a dashboard of token counts, language split and the dependency graph. Paste it, ask your question, and get an answer that names the exact class to change, and why.',
      'No config, no dependencies: just Python and a folder. It started as a tool for my own Talken codebase and is now on PyPI.'
    ],
    highlights: [
      { t: 'Whole-project context', d: 'File tree, build files, every class and interface, fields, numbered method signatures and all their docs.' },
      { t: 'Three languages', d: 'Java, Kotlin and Python — including mixed projects, with per-language percentages.' },
      { t: 'Token estimates', d: 'A total token count with a per-section breakdown, and which AI models’ context windows it fits.' },
      { t: 'Dependency graph', d: 'Which of your classes depend on which — from imports and in-body type references, no library noise.' },
      { t: 'Markdown or text', d: 'Plain context.txt by default, or a clean context.md with --md.' },
      { t: 'Slim mode', d: '--slim keeps only class names and signatures, to save tokens on huge projects.' },
      { t: 'Clipboard', d: '--clipboard copies the whole report, ready to paste.' },
      { t: '.jctxignore', d: 'Build folders are skipped automatically; add your own exclusions in one file.' }
    ],
    install: [
      { label: 'pip', code: 'pip install jctx' },
      { label: 'Windows (manual)', code: '# download the latest release zip, unzip it, then:\nSetup.bat   # run as administrator' }
    ],
    commands: [
      { cmd: 'Jctx <project_folder>', d: 'Write context.txt into the project and print the dashboard' },
      { cmd: '--md', d: 'Write a Markdown context.md instead' },
      { cmd: '--slim', d: 'Only class names and method signatures' },
      { cmd: '--no-tree', d: 'Skip the file tree section' },
      { cmd: '--clipboard', d: 'Copy the report to the clipboard' },
      { cmd: '--print', d: 'Also print the report to the console' }
    ],
    terminal: {
      title: 'Jctx — console dashboard',
      cmd: 'Jctx "C:\\projects\\Talken"',
      out: '================================================================\n LANGUAGE PERCENTAGES\n================================================================\n  Java    :  60.2%  ██████████████████████████████░░░░░░░░░░░░░░░░░░░░  (4,120 lines)\n  Kotlin  :  28.1%  ██████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  (1,920 lines)\n  Python  :  11.7%  █████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  (800 lines)\n================================================================\n DEPENDENCY GRAPH (project-internal)\n================================================================\n  EncryptionModule → (none)\n  MessagingModule → EncryptionModule, UserProfile\n  TalkenClient → EncryptionModule, MessagingModule, UserProfile\n================================================================\n TOKEN ESTIMATE\n================================================================\n  Total tokens : ~34,767\n\n  Context Window Fit:\n    Y Gemini 3.1 (2M)      Y GPT-5.4 (1M)      Y Claude 4.6 (1M)'
    },
    build: [['Language', 'Python 3.8+, standard library only'], ['Distribution', 'PyPI package, plus a Windows release zip'], ['Output', 'context.txt / context.md'], ['License', 'MIT']]
  },
  {
    id: 'codemeter',
    title: 'CodeMeter',
    tagline: 'Measure your code. Physically. How many Burj Khalifas tall is your codebase?',
    category: 'tools',
    year: '2026',
    tags: ['Java 21', 'CLI', 'GraalVM', 'Picocli'],
    poster: { from: '#0f172a', to: '#14b8a6', ink: '#fff', glyph: '📏' },
    stats: [['5,100+', 'lines of Java'], ['29', 'commits'], ['4', 'package managers'], ['6', 'export formats']],
    links: [{ label: 'GitHub', href: 'https://github.com/Shashwat-Gupta57/CodeMeter' }],
    story: [
      'Every line counter tells you a number. CodeMeter tells you what the number means. Ten thousand lines of code is a stack of paper nineteen millimetres tall, weighing almost a kilogram — and a big enough codebase is measured in football fields, Eiffel Towers and the trees it would take to print it.',
      'It is a fast, editorial-grade command-line app in Java 21 — not a TUI, just beautifully typeset output — with achievements, history, comparisons and a year-end "wrapped". It ships as a native GraalVM binary, so it starts instantly with no JVM, and it’s published to Homebrew, Winget, Scoop and Nix.'
    ],
    highlights: [
      { t: 'Physical metrics', d: 'Lines become meters, kilograms, pages, football fields, Eiffel Towers, Burj Khalifas and trees.' },
      { t: 'Blazing fast', d: 'Powered by scc and cloc underneath for the actual counting.' },
      { t: 'Achievements & ranks', d: 'Unlockable milestones that turn a growing codebase into a game.' },
      { t: 'History & compare', d: 'Every scan is remembered; compare your workspace with the last one.' },
      { t: 'Wrapped', d: 'A crafted end-of-year summary of everything you wrote.' },
      { t: 'Export anywhere', d: 'PDF, SVG, PNG, JSON, CSV and Markdown reports.' },
      { t: 'CI-friendly', d: 'Raw, script-friendly stats for pipelines.' },
      { t: 'Zero dependencies', d: 'A native GraalVM executable — instant start, no Java required.' }
    ],
    install: [
      { label: 'Homebrew', code: 'brew tap Shashwat-Gupta57/homebrew-tap\nbrew install codemeter' },
      { label: 'Winget', code: 'winget install ShashwatGupta.CodeMeter' },
      { label: 'Scoop', code: 'scoop bucket add shashwat-gupta57 https://github.com/Shashwat-Gupta57/scoop-bucket\nscoop install shashwat-gupta57/codemeter' },
      { label: 'Nix', code: 'nix run github:Shashwat-Gupta57/CodeMeter' },
      { label: 'JAR', code: 'java -jar codemeter.jar' }
    ],
    commands: [
      { cmd: 'codemeter scan .', d: 'Scan a project — the story mode' },
      { cmd: 'codemeter wrapped', d: 'Your end-of-year summary' },
      { cmd: 'codemeter history', d: 'Every scan, across every project' },
      { cmd: 'codemeter compare', d: 'This workspace against the last scan' },
      { cmd: 'codemeter milestones', d: 'Progress towards your next rank' },
      { cmd: 'codemeter stats', d: 'Raw metrics for CI/CD' },
      { cmd: 'codemeter export -f png -o report.png', d: 'Export to json, pdf, png, svg, csv or md' },
      { cmd: 'codemeter config', d: 'Tune the physical assumptions, like paper thickness' },
      { cmd: 'codemeter doctor', d: 'System diagnostics' },
      { cmd: 'codemeter benchmark', d: 'Measure parsing performance' }
    ],
    terminal: {
      title: 'codemeter-report.md — a real scan of CodeMeter itself',
      cmd: 'codemeter scan . && codemeter export -f md',
      out: 'Overview\n  Files ............. 103        Languages ........ 14\n  Code lines ........ 8,420      Comment lines .... 745\n  Blank lines ....... 1,274      Total lines ...... 10,439\n\nPhysical metrics\n  Stack height ...... 0.019 m    Pages ............ 190\n  Weight ............ 0.950 kg\n\nLanguage breakdown\n  Java ......... 50 files   4,300 code   51.1%\n  HTML ......... 18 files   2,290 code   27.2%\n  Bourne Shell .  3 files     305 code    3.6%\n  Markdown .....  1 file      269 code    3.2%\n  JSON .........  4 files     256 code    3.0%'
    },
    build: [['Language', 'Java 21'], ['CLI', 'Picocli'], ['Data', 'Gson · Toml4j'], ['Rendering', 'Apache PDFBox · Batik'], ['Binary', 'GraalVM native image'], ['Ships via', 'Homebrew · Winget · Scoop · Nix · GitHub Releases']]
  },
  {
    id: 'nglobe',
    title: 'NGlobe',
    tagline: 'Your machine’s network traffic, live, on a 3D globe.',
    category: 'tools',
    year: '2026',
    tags: ['Python', 'FastAPI', 'mitmproxy', 'React', 'Deck.gl'],
    poster: { from: '#020617', to: '#0891b2', ink: '#fff', icon: 'assets/img/icons/nglobe.svg', bare: true },
    stats: [['14,000+', 'lines of code'], ['60fps', '3D rendering'], ['1', 'command to start']],
    links: [{ label: 'GitHub', href: 'https://github.com/Shashwat-Gupta57/NGlobe' }],
    story: [
      'Wireshark and Fiddler are incredibly powerful, but they show your traffic as endless rows of text. They have no sense of place. When your laptop quietly talks to a server on another continent, you never feel it.',
      'NGlobe makes it visible. It intercepts your machine’s traffic, looks up where every request is going, and flies it across an interactive 3D globe in real time — so tracking requests routed to faraway data centres stop being invisible.'
    ],
    highlights: [
      { t: 'Interactive 3D globe', d: 'Built on Deck.gl and MapLibre for smooth 60 fps rendering.' },
      { t: 'Packets as particles', d: 'Every request becomes a particle flying to its destination server.' },
      { t: 'HTTPS too', d: 'mitmproxy captures both HTTP and decrypted HTTPS traffic.' },
      { t: 'Rich analytics', d: 'Exact IPs, autonomous systems, hostnames and transfer volumes in a live sidebar.' },
      { t: 'Zero configuration', d: 'nglobe start — a wizard handles certificates, proxy settings and GeoIP databases.' },
      { t: 'History', d: 'Every event is written asynchronously to SQLite, so you can look back.' }
    ],
    install: [{ label: 'From source', code: 'git clone https://github.com/Shashwat-Gupta57/NGlobe\ncd NGlobe && pip install .\nnglobe start' }],
    build: [['Capture', 'mitmproxy as a local proxy'], ['Pipeline', 'Python 3.11 · FastAPI event pipeline'], ['Geo', 'MaxMind GeoLite2 lookups'], ['Transport', 'WebSocket batches to the browser'], ['Frontend', 'React · TypeScript · Tailwind · Zustand'], ['Visuals', 'Deck.gl · MapLibre GL · Framer Motion'], ['Storage', 'SQLite via SQLModel']]
  },
  {
    id: 'workdesk',
    title: 'WorkDesk',
    tagline: 'A workspace where every file is an artifact with an unbreakable history.',
    category: 'web',
    year: '2026',
    tags: ['Next.js', 'TypeScript', 'PostgreSQL', 'Tailwind', 'shadcn'],
    poster: { from: '#18181b', to: '#a855f7', ink: '#fff', glyph: '▦' },
    stats: [['10,700+', 'lines of TypeScript'], ['3', 'database-enforced invariants']],
    links: [{ label: 'GitHub', href: 'https://github.com/Shashwat-Gupta57/WorkDesk' }],
    story: [
      'Shared drives copy files around until nobody knows which version is real. WorkDesk starts from three rules that never bend: every piece of work is a first-class artifact; sharing passes a reference, never a copy; and history is append-only.',
      'The rules aren’t conventions in the code — they are enforced by PostgreSQL itself. A trigger rejects any attempt to rewrite a version, restoring an old version clones it forward as a new one, and there is simply no API to edit history.'
    ],
    highlights: [
      { t: 'Artifacts, first-class', d: 'Every artifact is its own row with its own identity; nothing embeds another’s data.' },
      { t: 'Reference, not copy', d: 'Sharing and publishing point at the artifact — no duplicated files, ever.' },
      { t: 'Append-only history', d: 'Save, commit and restore all add versions; a database trigger rejects edits.' },
      { t: 'Archive explorer', d: 'Set trees, grid and list views, context menus and a details panel.' },
      { t: 'Artifact editor', d: 'Auto-save, commit, restore and a metadata panel.' },
      { t: 'Own auth', d: 'Hand-rolled bcrypt sessions, login, register and password reset.' }
    ],
    build: [['Framework', 'Next.js · React 19 · TypeScript (strict)'], ['Database', 'PostgreSQL via Kysely, with a migration runner'], ['UI', 'Tailwind · shadcn'], ['Integrity', 'Triggers enforce append-only versions']]
  },

  /* ---------------- talken ecosystem ---------------- */
  {
    id: 'drive-handler',
    title: 'Drive Handler',
    tagline: 'The Google Drive library that lets Talken keep your files in your own storage.',
    category: 'talken',
    year: '2025 – now',
    tags: ['Java 21', 'Android', 'Gradle', 'Google Drive API', 'OAuth 2'],
    poster: { from: '#0f2a1d', to: '#22c55e', ink: '#fff', glyph: '⇅' },
    stats: [['4,100+', 'lines of code'], ['v2.10', 'current version'], ['2', 'platforms'], ['45+', 'public methods']],
    story: [
      'Talken sends four-gigabyte videos without owning a single file server. The trick is that your files never leave your own Google Drive — and this library is how. It is a standalone module that handles sign-in, folders, uploads, downloads, sharing and quotas on the user’s own Drive.',
      'Its best idea is about failure. "Your Drive is full" and "you are going too fast" are both HTTP 403 — so a naive client either hammers Google forever or gives up on a temporary hiccup. Drive Handler classifies every failure into a reason, knows which ones are worth retrying and which need the user, and has a sentence ready that a person can actually read.',
      'There are two siblings: DriveHandler for the JavaFX desktop app, and DriveAndroid — a deliberate standalone copy for Android with PKCE sign-in and resumable, cancellable streaming transfers.'
    ],
    highlights: [
      { t: 'OAuth, every way', d: 'Desktop consent flow, cancel detection, an embedded web view, and "Continue with Google" identity claims.' },
      { t: 'Folders by path', d: 'ensureFolderPath creates only the missing parts of a path and returns its id.' },
      { t: 'Update in place', d: 'Write into a folder by name, replacing an existing file without creating duplicates.' },
      { t: 'Progress everywhere', d: 'Uploads and downloads report progress straight into a JavaFX ProgressIndicator.' },
      { t: 'Failures with reasons', d: 'DriveException tells "Drive full" from "rate limited", with retryable / needs-user flags.' },
      { t: 'Retries that know when to stop', d: 'DriveRetry backs off exponentially — and refuses to retry what waiting can’t fix.' },
      { t: 'Android with PKCE', d: 'Code verifier, S256 challenge and token exchange, no client secret on the phone.' },
      { t: 'Resumable & cancellable', d: 'Android streams uploads with the resumable protocol and can stop mid-transfer.' }
    ],
    api: [
      {
        group: 'DriveHandler · auth',
        intro: 'Desktop (JavaFX, JPMS module). Tokens are plain strings, so the app decides where to keep them.',
        items: [
          { sig: 'static void setScope(String scope)', d: 'Sets the single OAuth scope for Drive access (one of the DriveScopes constants).' },
          { sig: 'static String[] createNewRefreshToken()', d: 'Runs the OAuth consent flow and returns a new refresh token.' },
          { sig: 'static String[] createNewRefreshTokenWithCancelDetection()', d: 'The same consent flow, noticing when the user closes it.' },
          { sig: 'static String[] createNewRefreshTokenWithIdentity()', d: 'Consent flow that also returns the user’s OpenID identity — for “Continue with Google”.' },
          { sig: 'static String[] createNewRefreshTokenWithWebView()', d: 'Consent inside an embedded web view instead of the browser.' },
          { sig: 'static String getNewAccessToken(String refreshToken)', d: 'Trades a refresh token for a fresh one-hour access token.' },
          { sig: 'static boolean checkAccessToken(String accessToken)', d: 'Whether an access token is still valid.' }
        ]
      },
      {
        group: 'DriveHandler · folders & listing',
        items: [
          { sig: 'static String ensureFolderPath(String accessToken, String... pathSegments)', d: 'Returns the id of a folder path, creating only the parts that don’t exist yet.' },
          { sig: 'static String findChild(String accessToken, String parentId, String name, boolean folders)', d: 'Finds a child by exact name inside a folder, or null.' },
          { sig: 'static List<DriveEntry> listFolder(String accessToken, String folderId)', d: 'Everything directly inside a folder, as entries with id, name, MIME type and isFolder().' },
          { sig: 'static String createFolderInsideAppData(String accessToken, String folderName)', d: 'Creates a folder in the hidden app-data space.' },
          { sig: 'static String createFolderInsideOtherFolder(String accessToken, String parentFolderId, String newFolderName)', d: 'Creates a folder inside an existing one.' },
          { sig: 'static List<String> listAppDataFiles(String accessToken)', d: 'All files in the app-data folder, with their ids.' },
          { sig: 'static ArrayList<String> listOnlyIDOfAllFilesInsideAFolder(String accessToken, String folderId)', d: 'Just the ids of every file in a folder.' },
          { sig: 'static boolean checkExistence(String accessToken, String fileId)', d: 'Whether a file exists and isn’t trashed.' }
        ]
      },
      {
        group: 'DriveHandler · upload',
        items: [
          { sig: 'static String uploadFile(String accessToken, String filePath)', d: 'Uploads a file and returns its id.' },
          { sig: 'static String uploadFile(String accessToken, String filePath, ProgressIndicator progressIndicator)', d: 'Uploads into app data, updating a JavaFX progress indicator as it goes.' },
          { sig: 'static String uploadFileToFolder(String accessToken, String filePath, String folderId, ProgressIndicator progressIndicator)', d: 'Uploads into a specific folder, with progress.' },
          { sig: 'static String uploadOrUpdateInFolder(String accessToken, String filePath, String folderId, ProgressIndicator progressIndicator)', d: 'Uploads into a folder, replacing any file of the same name in place.' },
          { sig: 'static String uploadFileViaStreams(String accessToken, InputStream inputStream, long fileLength, String filePath)', d: 'Uploads from a stream of known length.' },
          { sig: 'static boolean updateFile(String accessToken, String fileID, File newFile)', d: 'Replaces a file’s content, keeping its id.' }
        ]
      },
      {
        group: 'DriveHandler · download & share',
        items: [
          { sig: 'static byte[] downloadBytes(String accessToken, String fileId)', d: 'A private file’s bytes, authenticated.' },
          { sig: 'static byte[] downloadByName(String accessToken, String folderId, String name)', d: 'Finds a file by name in a folder and returns its bytes, or null.' },
          { sig: 'static boolean downloadFileToPath(String accessToken, String fileId, String filePath, String newFileName)', d: 'Downloads a file to disk under a new name.' },
          { sig: 'static boolean downloadFileFromFileIDAndSaveToPath(String fileId, String targetDir, String newFileName, ProgressIndicator progressIndicator)', d: 'Downloads a shared file by id alone, with progress — the share link is built for you.' },
          { sig: 'static boolean downloadFileFromShareLinkAndSaveToPath(String shareLink, String filePath, String newFileName)', d: 'Downloads straight from a share link.' },
          { sig: 'static String getFileShareLink(String accessToken, String fileId)', d: 'A read-only “anyone with the link” URL.' },
          { sig: 'static boolean elevateAccess(String accessToken, String fileId)', d: 'Makes a file readable by anyone with its id — so Talken can pass just a file id in a message.' },
          { sig: 'static String extractFileIdFromShareLink(String shareLink)', d: 'Pulls the file id out of any Drive share link.' },
          { sig: 'static boolean deleteFile(String accessToken, String fileId)', d: 'Deletes a file.' }
        ]
      },
      {
        group: 'DriveHandler · storage',
        items: [
          { sig: 'static String getStorageOccupiedFormatted(String accessToken)', d: 'Drive space used, as text like “15.2 GB”.' },
          { sig: 'static double getStorageOccupied(String accessToken, boolean inGigaBytes)', d: 'Drive space used, as a number.' },
          { sig: 'static String getTotalStorageFormatted(String accessToken)', d: 'Total Drive space, as text.' },
          { sig: 'static double getTotalStorage(String accessToken, boolean inGigaBytes)', d: 'Total Drive space, as a number.' },
          { sig: 'static String getStorageUsedByApp(String accessToken)', d: 'How much of it this app is using.' }
        ]
      },
      {
        group: 'DriveException · DriveRetry',
        intro: 'A failure with a reason, not just a number — and a retry loop that knows when to give up.',
        items: [
          { sig: 'Reason getReason()', d: 'Why it failed — e.g. Drive full vs. rate limited, which are both HTTP 403.' },
          { sig: 'boolean isRetryable()', d: 'Whether trying again later could succeed without the user doing anything.' },
          { sig: 'boolean needsUserAction()', d: 'Whether the user must act first (sign in again, free up space).' },
          { sig: 'String userMessage()', d: 'A sentence fit for a person: no codes, no jargon, never alarming about the wrong thing.' },
          { sig: 'static DriveException from(HttpURLConnection conn, int code, String what)', d: 'Classifies a failed connection, reading its error body.' },
          { sig: 'static DriveException network(IOException e, String what)', d: 'Wraps a plain network failure.' },
          { sig: 'static <T> T DriveRetry.run(String what, DriveCall<T> call)', d: 'Runs a call, retrying only retryable failures with exponential backoff.' }
        ]
      },
      {
        group: 'DriveAndroid',
        intro: 'The Android sibling: no desktop OAuth client, PKCE instead of a secret, streams instead of files.',
        items: [
          { sig: 'static String codeVerifier()', d: 'A fresh PKCE verifier — 32 random bytes, URL-safe Base64.' },
          { sig: 'static String codeChallenge(String verifier)', d: 'The S256 challenge for a verifier.' },
          { sig: 'static String authUrl(String clientId, String redirectUri, String codeChallenge)', d: 'The consent URL to open in a browser or Custom Tab.' },
          { sig: 'static Tokens exchangeCode(String clientId, String code, String redirectUri, String codeVerifier)', d: 'Redeems the authorisation code from the redirect.' },
          { sig: 'static String refreshAccessToken(String clientId, String refreshToken)', d: 'A fresh access token from a stored refresh token.' },
          { sig: 'static String upload(String accessToken, InputStream in, long length, String fileName, String mimeType, Progress progress, Cancellation cancel)', d: 'A resumable, stoppable streaming upload; returns the new file id.' },
          { sig: 'static void download(String accessToken, String fileId, OutputStream out, Progress progress, Cancellation cancel)', d: 'Streams a file into any output, with progress, stoppable.' },
          { sig: 'static boolean makePublic(String accessToken, String fileId)', d: 'Grants anyone-with-the-link read access, so a peer on another account can fetch it.' },
          { sig: 'static String uploadOrUpdateInFolder(String accessToken, String folderId, String name, byte[] content)', d: 'Writes bytes under a name, replacing an existing file in place.' },
          { sig: 'static long storageUsedBytes(String accessToken)', d: 'Bytes used across the account, or -1.' },
          { sig: 'static String accountEmail(String accessToken)', d: 'Which Google account a token belongs to.' },
          { sig: 'static <T> T retry(String what, DriveCall<T> call)', d: 'Runs a Drive call, retrying only where retrying can help.' }
        ]
      }
    ],
    build: [['Desktop', 'Java 21 JPMS module · JavaFX · Gradle'], ['Android', 'DriveAndroid — standalone, HttpURLConnection, PKCE'], ['APIs', 'Google API Client · Drive v3 · OAuth client'], ['Used by', 'Talken desktop & Android']]
  },
  {
    id: 'talken-rest-api',
    title: 'Talken REST API',
    tagline: 'The phone book and post office behind Talken — never a vault.',
    category: 'talken',
    year: '2025 – now',
    tags: ['Java 21', 'Spring Boot 3', 'MapDB'],
    poster: { from: '#26234a', to: '#5450AA', ink: '#fff', icon: 'assets/img/icons/talken.png' },
    stats: [['11,600+', 'lines of Java'], ['90', 'source files'], ['1,000', 'offline messages held per user'], ['3 yrs', 'offline retention']],
    story: [
      'A peer-to-peer messenger still needs a way for two strangers to find each other. Talken’s REST API is the smallest possible answer: a phone book, a key-recovery desk and a post-office box — and nothing else. It never routes a live conversation and never holds a readable message.',
      'Written from scratch in Spring Boot, it ships its own client library that both the desktop and Android apps use, and every request that changes anything is authenticated by a proof derived from the user’s own key.'
    ],
    highlights: [
      { t: 'Discovery', d: 'Find a person and their current mesh address — the public user directory.' },
      { t: 'Key recovery', d: 'Your private key, sealed on your own device before it ever arrives, recoverable with your password.' },
      { t: 'Offline mailbox', d: 'Holds up to 1,000 sealed messages per person for three years and hands them over on sign-in.' },
      { t: 'Groups & channels', d: 'Membership, roles and channel metadata, enforced on every change.' },
      { t: 'Own client library', d: 'A typed Java client shipped into both apps.' },
      { t: 'Proof, not passwords', d: 'Mutations carry an Argon2-derived identity proof, never the key itself.' }
    ],
    build: [['Framework', 'Spring Boot 3 · Java 21'], ['Storage', 'MapDB'], ['Client', 'talken-rest-client, used by desktop and Android'], ['Deploy', 'Push to main → api.talken.in']]
  },
  {
    id: 'talken-toolkit',
    title: 'Talken Toolkit',
    tagline: 'Talken’s companion updater — check, download, install.',
    category: 'talken',
    year: '2025',
    tags: ['Java', 'JavaFX'],
    poster: { from: '#2a1f3d', to: '#8580C8', ink: '#fff', icon: 'assets/img/icons/talken.png' },
    story: ['A small JavaFX utility from Talken’s early days: it checks for the latest Talken version, then downloads the new build into your Talken directory — before the app learned to update itself.'],
    highlights: [{ t: 'Version check', d: 'Reads the latest published Talken version.' }, { t: 'One-click download', d: 'Fetches the build into the Talken folder you choose, with progress.' }],
    build: [['UI', 'JavaFX with FXML'], ['Downloads', 'Its own file downloader']]
  },

  /* ---------------- desktop apps ---------------- */
  {
    id: 'sg-paint',
    title: 'SG Paint',
    tagline: 'A full-featured painting app — MS Paint, reimagined.',
    category: 'desktop',
    year: '2024',
    tags: ['Java', 'Swing'],
    links: [{ label: 'GitHub', href: 'https://github.com/Shashwat-Gupta57/SG-Paint' }, { label: 'Download', href: 'https://github.com/Shashwat-Gupta57/SG-Paint/releases/latest' }],
    poster: { from: '#1f2937', to: '#ef4444', ink: '#fff', icon: 'assets/img/icons/sgpaint.png', bare: true },
    stats: [['3,500+', 'lines of Java'], ['84', 'compiled classes'], ['20+', 'tools & swatches']],
    shots: [
      { src: S + 'sgpaint-2.webp', caption: 'Ellipses, rectangles and freehand strokes on the canvas' },
      { src: S + 'sgpaint-1.webp', caption: 'The full tool bar: swatches, stroke widths, shapes, pencil, fill, eraser, resize' },
      { src: 'assets/img/sg-paint.png', caption: 'A fresh canvas' }
    ],
    story: [
      'Every Windows kid has drawn in MS Paint. SG Paint is what happened when I decided to build my own — from an empty JFrame to a full painting program, with its own canvas, its own tools and its own file handling.',
      'Everything you see is hand-drawn in Swing: the swatch grid, the custom colour picker, the shape tools, the resize panel with its arrow nudges, and native open/save dialogs.'
    ],
    highlights: [
      { t: 'Shapes', d: 'Rectangles, rounded rectangles, ellipses, triangles and lines — outlined or filled.' },
      { t: 'Pencil, fill & eraser', d: 'Freehand drawing, flood fill and an eraser.' },
      { t: 'Colour', d: 'A swatch grid plus a full built-in colour picker for any custom colour.' },
      { t: 'Stroke widths', d: 'Pick how thick every line and outline is.' },
      { t: 'Resize', d: 'Set the canvas width and height precisely, or nudge it with arrows.' },
      { t: 'Files', d: 'New, open and save-as images through native file dialogs.' }
    ],
    build: [['UI', 'Java Swing, custom-painted canvas'], ['Dialogs', 'Native file chooser via JNA'], ['Classes', '84 compiled classes']]
  },
  {
    id: 'photos-utility',
    title: 'Photos Utility',
    tagline: 'A fast desktop gallery for folders of photos and videos.',
    category: 'desktop',
    year: '2026',
    tags: ['Java', 'JavaFX', 'VLC'],
    poster: { from: '#0b1324', to: '#38bdf8', ink: '#fff', icon: 'assets/img/icons/photos.jpg' },
    stats: [['2,100+', 'lines of Java'], ['11', 'classes']],
    story: ['Windows Explorer is a bad way to look at photos. Photos Utility points at any folder and shows every photo and video inside as real thumbnails — the way a phone gallery feels, on the desktop — with videos that actually play.'],
    highlights: [
      { t: 'Folder & media tiles', d: 'Subfolders and media side by side, with Windows-native thumbnails.' },
      { t: 'Video', d: 'Video thumbnails and full playback through VLC.' },
      { t: 'Viewer', d: 'A full-screen viewer for stepping through a folder.' },
      { t: 'Recents', d: 'Re-open the folders you looked at last.' }
    ],
    build: [['UI', 'JavaFX'], ['Thumbnails', 'Windows shell thumbnailer + its own thumbnail service'], ['Video', 'VLC integration']]
  },
  {
    id: 'notes',
    title: 'Notes',
    tagline: 'An advanced text editor beyond Notepad — and the app that grew into Notes+.',
    category: 'desktop',
    year: '2024',
    tags: ['Java', 'Swing', 'Encryption'],
    links: [{ label: 'GitHub', href: 'https://github.com/Shashwat-Gupta57/Notes' }, { label: 'Download', href: 'https://github.com/Shashwat-Gupta57/Notes/releases/latest' }, { label: 'Its successor: Notes+', href: 'projects/notes-plus.html', internal: true }],
    poster: { from: '#292524', to: '#eab308', ink: '#fff', icon: 'assets/img/icons/notes.png', bare: true },
    stats: [['2,500+', 'lines of Java'], ['8', 'source files']],
    shots: [
      { src: S + 'notes-1.webp', caption: 'A note, with the status bar tracking line, column and font size' },
      { src: S + 'notes-2.webp', caption: 'The Design menu: per-file and universal colours, image backgrounds, fonts' },
      { src: S + 'notes-3.webp', caption: 'A file with its own background colour' }
    ],
    story: [
      'Notepad hasn’t really changed in thirty years. Notes started as my Notepad clone and kept going: themes per file and for everything at once, image backgrounds, fonts, automatic backups — and its own encryption, so a text file can be locked.',
      'It’s where Notes+ began. In 2026 I redesigned Notes from the ground up and extended everything it could do — it grew into Notes+: six kinds of note instead of one, Android and the web alongside the desktop, live sync on one account, real AES-256-GCM encryption in place of my old cipher, and hidden vaults underneath. Notes is the first chapter; Notes+ is what it became.'
    ],
    highlights: [
      { t: 'Per-file design', d: 'Give any single file its own background and text colour.' },
      { t: 'Universal themes', d: 'Or change the background and text colour of every file at once.' },
      { t: 'Image backgrounds', d: 'Set a picture as the background behind your text.' },
      { t: 'Fonts', d: 'Change the font, its size and style.' },
      { t: 'Backups', d: 'Automatic backups into a folder you choose.' },
      { t: 'Encryption', d: 'Encrypt a file, decrypt it back — built into the editor’s Privacy menu.' },
      { t: 'It became Notes+', d: 'Redesigned and extended into Notes+ — six kinds of note, three platforms, live sync, AES-256-GCM and hidden vaults.' }
    ],
    build: [['UI', 'Java Swing'], ['Crypto', 'Its own Encrypter / Decrypter classes'], ['Dialogs', 'Native file chooser via JNA']]
  },
  {
    id: 'color-picker',
    title: 'Color Picker',
    tagline: 'Pick any colour, copy it as RGB, HEX or HSB.',
    category: 'desktop',
    year: '2024',
    tags: ['Java', 'Swing', 'JavaFX'],
    links: [{ label: 'GitHub', href: 'https://github.com/Shashwat-Gupta57/Color-Picker' }, { label: 'Download', href: 'https://github.com/Shashwat-Gupta57/Color-Picker/releases/latest' }],
    poster: { from: '#7c3aed', to: '#f97316', ink: '#fff', icon: 'assets/img/icons/colorpicker.png', bare: true },
    shots: [
      { src: S + 'colorpicker-2.webp', caption: 'After picking a colour: the whole window takes it on' },
      { src: S + 'colorpicker-1.webp', caption: 'RGB, HEX and HSB, each one click from the clipboard' }
    ],
    story: ['A tiny tool I built twice: first in Swing, then again from scratch in JavaFX. Pick a colour and the whole window becomes it, with its RGB, HEX and HSB codes one click away from the clipboard — the thing I kept needing while designing my other apps.'],
    highlights: [
      { t: 'Three formats', d: 'RGB, HEX and HSB side by side.' },
      { t: 'One-click copy', d: 'Each format has its own copy button.' },
      { t: 'Live preview', d: 'The window itself turns into the colour you picked.' },
      { t: 'Built twice', d: 'The Swing original, then a JavaFX rebuild.' }
    ],
    build: [['v1', 'Java Swing with JColorChooser'], ['v2', 'JavaFX rebuild (Maven)']]
  },
  {
    id: 'floating-keyboard',
    title: 'Floating Keyboard',
    tagline: 'A full on-screen keyboard that floats above everything.',
    category: 'desktop',
    year: '2024',
    tags: ['Java', 'Swing'],
    poster: { from: '#111827', to: '#64748b', ink: '#fff', icon: 'assets/img/icons/keyboard.jpg' },
    shots: [{ src: S + 'keyboard-1.webp', caption: 'A complete layout — function row, arrows, modifiers' }],
    story: ['A complete virtual keyboard — function row, number row, modifiers and arrows — in an always-on-top window that floats over whatever you’re doing, and types into it.'],
    highlights: [
      { t: 'Full layout', d: 'Esc and F1–F12, numbers, letters, punctuation, Shift, Ctrl, Win, Alt, Space and arrows.' },
      { t: 'Always on top', d: 'It floats above every other window.' },
      { t: 'Types for real', d: 'Each key press is sent to the app you’re using.' }
    ],
    build: [['UI', 'Java Swing'], ['Input', 'Key actions dispatched to the focused app']]
  },
  {
    id: 'jre-installer',
    title: 'JRE Installer',
    tagline: 'One click to make any Windows PC ready for my Java apps.',
    category: 'desktop',
    year: '2024',
    tags: ['Java', 'Swing', 'Windows'],
    links: [{ label: 'GitHub', href: 'https://github.com/Shashwat-Gupta57/JRE-Installer' }, { label: 'Download', href: 'https://github.com/Shashwat-Gupta57/JRE-Installer/releases/latest' }],
    poster: { from: '#1c1917', to: '#f97316', ink: '#fff', icon: 'assets/img/icons/jre.png' },
    stats: [['1', 'button'], ['0', 'admin rights needed'], ['21 LTS', 'Eclipse Temurin bundled'], ['12', 'apps that use it']],
    shots: [{ src: S + 'jre-2.webp', caption: 'Version 1.0.0 — one button, no admin rights' }, { src: S + 'jre-1.webp', caption: 'The original 2024 installer' }],
    story: [
      'Sharing my Java apps with friends meant first explaining what Java is. So I wrote an installer: one button copies a bundled Java runtime into the user’s own app-data folder — no admin rights, no setup wizard — and every one of my apps can run.',
      'Version 1.0.0 fixes the bug that made the original spin forever: it looked for the bundled runtime wherever it happened to be launched from, so the copy silently failed. Now it finds the runtime next to its own exe, copies it in the background with a live percentage, and swaps it in only once the copy is complete.',
      'It is the foundation of all my published desktop apps: each one’s exe looks for Java in exactly the folder this installs to, then falls back to JAVA_HOME.'
    ],
    highlights: [
      { t: 'One button', d: '“Start Installing JRE” is the whole interface.' },
      { t: 'No admin rights', d: 'Installs into %LOCALAPPDATA%\\OpenJDK Adoptium JRE - SG\\JRE, inside the user’s own profile.' },
      { t: 'Bundled & verified', d: 'Ships Eclipse Temurin 21 LTS, checked against Adoptium’s published SHA-256.' },
      { t: 'Live progress', d: 'A timer-driven spinner and a percentage — the window never freezes.' },
      { t: 'Safe reinstall', d: 'Copies into a fresh folder and swaps it in only when complete, so Java versions never get mixed.' },
      { t: 'Clear errors', d: 'A readable message and Retry if the runtime is missing or the copy fails.' }
    ],
    build: [['UI', 'Java Swing'], ['Runtime', 'Eclipse Temurin 21.0.12.1 LTS (bundled)'], ['Install', 'Background SwingWorker copy into a staging folder, then an atomic swap'], ['Packaging', 'Launch4j exe that runs on its own bundled JRE']]
  },
  {
    id: 'cps-tester',
    title: 'CPS Tester',
    tagline: 'How fast can you click? My very first GUI app.',
    category: 'desktop',
    year: '2023',
    tags: ['Java', 'Swing'],
    poster: { from: '#18181b', to: '#22d3ee', ink: '#fff', icon: 'assets/img/icons/cps.png' },
    shots: [{ src: S + 'cps-1.webp', caption: 'Clicks Per Second Test' }],
    story: ['The first app I ever built with a window instead of a terminal. Click start, then click as fast as you can — it counts, times and tells you your clicks per second. Small, but it’s where everything after it began.'],
    highlights: [{ t: 'Countdown', d: 'Get ready, then GO!' }, { t: 'Your CPS', d: 'Clicks counted and divided by the seconds.' }, { t: 'Restart', d: 'Try again, instantly.' }],
    build: [['UI', 'Java Swing, custom fonts']]
  },

  /* ---------------- widgets ---------------- */
  {
    id: 'widgets',
    title: 'Widgets',
    tagline: 'Three desktop widgets — weather, a transparent clock, and both at once.',
    category: 'widget',
    year: '2024',
    tags: ['Java', 'Swing', 'REST', 'JSON'],
    links: [{ label: 'GitHub', href: 'https://github.com/Shashwat-Gupta57/Widgets' }, { label: 'Download', href: 'https://github.com/Shashwat-Gupta57/Widgets/releases/latest' }],
    poster: { from: '#0c4a6e', to: '#fbbf24', ink: '#fff', icon: 'assets/img/icons/mix.png', bare: true },
    stats: [['3', 'widgets'], ['3', 'branches, one repo'], ['5 min', 'weather refresh']],
    shots: [
      { src: S + 'mix-1.webp', caption: 'MixWidget — time, date and live weather on one panel' },
      { src: S + 'weather-1.webp', caption: 'Weather Widget — conditions, temperature, wind, pressure, humidity' },
      { src: S + 'clock-1.webp', caption: 'Clock Widget — just the digits, floating on the wallpaper' },
      { src: 'assets/img/weather-widget.png', caption: 'The Weather Widget on the desktop' }
    ],
    story: [
      'Windows took its desktop gadgets away years ago. These bring them back: small, borderless, translucent windows that sit on the wallpaper and stay out of your way — each one draggable, and each one remembering where you left it.',
      'There are three, each on its own branch of the repo: a Weather Widget that pulls live conditions from WeatherAPI, a transparent Clock Widget with a control panel to recolour, move and resize it, and MixWidget, which puts the time, the date and the weather on one panel with its own weather art.'
    ],
    highlights: [
      { t: 'Weather Widget', d: 'Live conditions, temperature, wind speed and direction, pressure and humidity — refreshed every five minutes.' },
      { t: 'Clock Widget', d: 'A transparent clock with a control panel: recolour it, move it, resize it, add or remove it. Plus 24-hour and JavaFX versions.' },
      { t: 'MixWidget', d: 'Time, date and weather together, with its own illustrations for sun, cloud, rain, fog, snow, dust and storms.' },
      { t: 'Borderless & translucent', d: 'Rounded, see-through panels with no window chrome.' },
      { t: 'Drag anywhere', d: 'Each widget remembers its position between launches.' },
      { t: 'Your own key', d: 'The WeatherAPI key and city live in weather.properties beside the app — never in the code.' }
    ],
    install: [
      { label: 'Download', code: '1. Install Java once with the JRE Installer (no admin rights)\n2. Download a widget from the Widgets releases page\n3. Unzip it anywhere and run the .exe' },
      { label: 'Branches', code: 'git clone -b weather https://github.com/Shashwat-Gupta57/Widgets\ngit clone -b clock   https://github.com/Shashwat-Gupta57/Widgets\ngit clone -b mix     https://github.com/Shashwat-Gupta57/Widgets' },
      { label: 'weather.properties', code: 'apiKey=YOUR_FREE_WEATHERAPI_KEY\ncity=Prayagraj' }
    ],
    build: [['UI', 'Java Swing, custom rounded panels, undecorated windows'], ['Weather', 'WeatherAPI over HTTP, parsed with org.json'], ['Settings', 'widget.properties (position) · weather.properties (key, city)'], ['Repo', 'One repo, a branch per widget']]
  },

  /* ---------------- games ---------------- */
  {
    id: 'rex-run',
    title: 'Rex Run',
    tagline: 'My first game. An endless runner inspired by Chrome Dino and Geometry Dash.',
    category: 'game',
    year: '2024',
    tags: ['Java', 'Swing', '2D', 'Game loop'],
    links: [{ label: 'GitHub', href: 'https://github.com/Shashwat-Gupta57/Rex-Run' }, { label: 'Download', href: 'https://github.com/Shashwat-Gupta57/Rex-Run/releases/latest' }],
    poster: { from: '#3f3f46', to: '#facc15', ink: '#fff', icon: 'assets/img/icons/rexrun.png', bare: true, pixel: true },
    stats: [['6,300+', 'lines of Java'], ['8', 'game classes'], ['∞', 'runs']],
    shots: [
      { src: S + 'rexrun-1.webp', caption: 'Title screen — his name is Rex' },
      { src: S + 'rexrun-3.webp', caption: 'Mid-run: score, lives and coins' },
      { src: S + 'rexrun-4.webp', caption: 'Dodging stone blocks and jump pillars' },
      { src: S + 'rexrun-2.webp', caption: 'Pause menu with the custom avatar' }
    ],
    story: [
      'The first game I ever built, right after the terminal stopped being enough. Rex Run borrows the simplicity of Chrome’s offline dinosaur and the rhythm of Geometry Dash — and then adds everything I wished those games had.',
      'There’s an economy (collect coins, spend them in the shop), lives you can pick up mid-run, an avatar editor, settings and saved progress, all on a game loop I wrote myself.'
    ],
    highlights: [
      { t: 'Endless running', d: 'Stone blocks, pillars to jump and obstacles that never stop coming.' },
      { t: 'Gravity flip', d: 'Shift flips gravity — Rex runs along the ceiling until you flip him back.' },
      { t: 'Shields', d: 'A shield power-up that absorbs a hit.' },
      { t: 'Coins & lives', d: 'Collect coins and hearts as you run.' },
      { t: 'The shop', d: 'Spend your coins.' },
      { t: 'Avatar editor', d: 'Make Rex your own.' },
      { t: 'Saves', d: 'Progress is saved between sessions.' },
      { t: 'Pause anytime', d: 'Resume, shop, settings or exit from the pause menu.' }
    ],
    build: [['Engine', 'Hand-written game loop in Swing'], ['Objects', 'Blocks, coins, lives, jump pillars as their own classes'], ['Saves', 'Plain-text save file']]
  },
  {
    id: 'flying-dual',
    title: 'Flying Dual',
    tagline: 'A local two-player dogfight on one keyboard.',
    category: 'game',
    year: '2024',
    tags: ['Java', 'Swing', '2D', 'Multiplayer'],
    links: [{ label: 'GitHub', href: 'https://github.com/Shashwat-Gupta57/Flying-Dual' }, { label: 'Download', href: 'https://github.com/Shashwat-Gupta57/Flying-Dual/releases/latest' }],
    poster: { from: '#052e16', to: '#dc2626', ink: '#fff', icon: 'assets/img/icons/flyingdual.png' },
    stats: [['1,200+', 'lines of Java'], ['2', 'players, 1 keyboard']],
    shots: [
      { src: S + 'flyingdual-2.webp', caption: 'Red vs green, health bars up top, the round timer counting down' },
      { src: S + 'flyingdual-3.webp', caption: 'Bullets in flight' },
      { src: S + 'flyingdual-1.webp', caption: 'The start screen' },
      { src: 'assets/img/flying-dual.png', caption: 'Another round' }
    ],
    story: ['Two players, one keyboard, one sky. Name your pilots, pick a difficulty, and fly against each other with health bars draining and a round timer counting down — a local multiplayer shooter on a game loop I wrote from scratch.'],
    highlights: [
      { t: 'Two players', d: 'Both on one keyboard, each with their own controls.' },
      { t: 'Health bars', d: 'Every hit drains the bar at the top of the screen.' },
      { t: 'Round timer', d: 'Win before time is up.' },
      { t: 'Difficulty', d: 'Pick how hard the round is.' },
      { t: 'Pilots', d: 'Enter both players’ names before take-off.' }
    ],
    build: [['Engine', 'Swing game loop'], ['Entities', 'Players, bullets and an idle state as classes']]
  },
  {
    id: 'ping-pong',
    title: 'Ping Pong',
    tagline: 'Two-player pong with your own colours.',
    category: 'game',
    year: '2024',
    tags: ['Java', 'Swing', '2D'],
    links: [{ label: 'GitHub', href: 'https://github.com/Shashwat-Gupta57/Ping-Pong' }, { label: 'Download', href: 'https://github.com/Shashwat-Gupta57/Ping-Pong/releases/latest' }],
    poster: { from: '#0f172a', to: '#06b6d4', ink: '#fff', icon: 'assets/img/icons/pingpong.png' },
    shots: [
      { src: S + 'pingpong-2.webp', caption: 'A rally in progress' },
      { src: S + 'pingpong-1.webp', caption: 'Name both players' }
    ],
    story: ['Classic two-player pong — named players, a score for each side, a game-over screen that knows a draw from a win, and a settings screen to recolour the ball, both paddles and the background.'],
    highlights: [{ t: 'Two players', d: 'Each paddle on its own keys.' }, { t: 'Your colours', d: 'Recolour the ball, both paddles and the background.' }, { t: 'Pause & resume', d: 'Stop and pick up where you left off.' }],
    build: [['Engine', 'Swing game loop']]
  },
  {
    id: 'flappy-bird',
    title: 'Flappy Bird',
    tagline: 'Tap, flap, don’t touch the pipes.',
    category: 'game',
    year: '2024',
    tags: ['Java', 'Swing', '2D'],
    links: [{ label: 'GitHub', href: 'https://github.com/Shashwat-Gupta57/Flappy-Bird' }, { label: 'Download', href: 'https://github.com/Shashwat-Gupta57/Flappy-Bird/releases/latest' }],
    poster: { from: '#065f46', to: '#38bdf8', ink: '#fff', icon: 'assets/img/icons/flappy.png' },
    shots: [
      { src: S + 'flappy-1.webp', caption: 'Mid-flight between the pipes, high score in the corner' },
      { src: S + 'flappy-2.webp', caption: 'Press space to jump' }
    ],
    story: ['My take on the one-button classic, built from scratch in Swing — my own gravity and flap physics, a pipe generator, a scrolling city skyline and a high score that survives restarts.'],
    highlights: [{ t: 'One button', d: 'Space to flap.' }, { t: 'Real physics', d: 'Gravity and flap impulse, written by hand.' }, { t: 'High score', d: 'Your best run, remembered.' }],
    build: [['Engine', 'Swing game loop'], ['Objects', 'Bird, pipes and inverted pipes as classes']]
  },
  {
    id: 'tic-tac-toe',
    title: 'Tic Tac Toe',
    tagline: 'The classic, with a ten-round scoreboard.',
    category: 'game',
    year: '2024',
    tags: ['Java', 'Swing'],
    links: [{ label: 'GitHub', href: 'https://github.com/Shashwat-Gupta57/Tic-Tac-Toe' }, { label: 'Download', href: 'https://github.com/Shashwat-Gupta57/Tic-Tac-Toe/releases/latest' }],
    poster: { from: '#312e81', to: '#f472b6', ink: '#fff', icon: 'assets/img/icons/tictactoe.png' },
    shots: [
      { src: S + 'tictactoe-2.webp', caption: 'A game in progress, scoreboard on the left' },
      { src: S + 'tictactoe-1.webp', caption: 'Round one to X' }
    ],
    story: ['Two-player tic-tac-toe with a scoreboard that keeps count across ten rounds, plus restart for the board and reset for the whole match.'],
    highlights: [{ t: 'Scoreboard', d: 'Ten rounds of wins for X and O.' }, { t: 'Restart & reset', d: 'A new board, or a whole new match.' }],
    build: [['UI', 'Java Swing']]
  },
  {
    id: 'memo',
    title: 'Memo',
    tagline: 'A colour-sequence memory game. How long a pattern can you remember?',
    category: 'game',
    year: '2024',
    tags: ['Java', 'Swing'],
    links: [{ label: 'GitHub', href: 'https://github.com/Shashwat-Gupta57/Memo' }, { label: 'Download', href: 'https://github.com/Shashwat-Gupta57/Memo/releases/latest' }],
    poster: { from: '#422006', to: '#facc15', ink: '#fff', icon: 'assets/img/icons/memo.png' },
    shots: [
      { src: S + 'memo-2.webp', caption: 'The sequence playing — watch which colour lights up' },
      { src: S + 'memo-1.webp', caption: 'Start, with the high score' }
    ],
    story: ['Four colours light up in a sequence; repeat it back. Every round adds one more step, until your memory gives out. A Simon-style game with a running score and a high score to beat.'],
    highlights: [{ t: 'Growing sequences', d: 'One more colour every round.' }, { t: 'Score & high score', d: 'Shown right in the centre.' }],
    build: [['UI', 'Java Swing']]
  },
  {
    id: 'terminal-game',
    title: 'Terminal Game',
    tagline: 'A 9th grader, a school textbook, two lines from outside — and 3,279 lines of Java.',
    category: 'game',
    year: 'Nov 2023',
    tags: ['Java', 'BlueJ', 'Terminal', 'Class 9'],
    links: [{ label: 'GitHub', href: 'https://github.com/Shashwat-Gupta57/Terminal-Game' }, { label: 'Download', href: 'https://github.com/Shashwat-Gupta57/Terminal-Game/releases/latest' }, { label: 'Play it on the home page', href: 'index.html#walker', internal: true }],
    poster: { from: '#0a0a0b', to: '#ff6a3d', ink: '#fff', icon: 'assets/img/icons/terminal.png' },
    stats: [['3,279', 'lines, in one main()'], ['263', 'do-while loops'], ['942', 'print statements'], ['55', 'screen clears']],
    story: [
      'In the half-yearly exams of 9th grade I genuinely disliked coding. It seemed pointless. Then one evening I wondered whether I could make a character walk across the BlueJ terminal from what I typed — and a month later I had written this.',
      'It is built from exactly what the 9th-grade Computer Applications syllabus teaches: variables, Scanner input, if-else, for loops, String comparisons and printing. Only two things came from outside the classroom — the code that clears the terminal, and the do-while loop. That was the whole toolkit.',
      'With it I built a game engine by hand. There are no arrays of sprites, no classes, no methods besides main: every frame of every animation is drawn line by line, character by character, out of nested loops that print spaces and slashes into exactly the right column — 942 print statements choreographed so that a little (^_^) falls from the top of the screen, lands with his arms up, and walks wherever you tell him.',
      'A title screen, a settings menu that changes the animation speed and turns the loading screen off, a percentage loading bar, a gamer tag, a pause screen, typed commands and secret hash-codes that switch on an action mode and summon a second player. It is the most anyone could squeeze out of a school textbook — and it is the reason everything I have built since exists.'
    ],
    showcase: '<section class="section pv-sec" id="toolkit"><div class="wrap"><header class="sec-head" data-reveal><span class="sec-num mono">✦</span><div><p class="eyebrow mono">The entire toolkit</p><h2 class="sec-title">Everything it’s <em>made of.</em></h2></div><p class="sec-sub">Counted from the source file itself.</p></header>'
      + '<div class="kit" data-reveal><div class="kit-col"><h3 class="mono">from the 9th-grade syllabus</h3><ul>'
      + '<li><b>155</b> for loops</li><li><b>56</b> if statements, <b>29</b> else branches</li><li><b>942</b> System.out.print calls</li><li><b>24</b> int, String, boolean and long variables</li><li><b>24</b> String comparisons with .equals()</li><li><b>10</b> Scanner reads</li><li><b>1</b> class, <b>1</b> method — main()</li></ul></div>'
      + '<div class="kit-col kit-outside"><h3 class="mono">from outside the classroom</h3><ul><li><b>55</b> × <code>System.out.print("\\u000C")</code><span>clears the BlueJ terminal so the next frame can be drawn</span></li><li><b>263</b> × <code>do { … } while (…);</code><span>the loop every frame is built from</span></li></ul><p class="kit-note">That’s it. Two ideas, used 318 times.</p></div></div>'
      + '<div class="kit-frames" data-reveal><figure><pre class="mono">\\(^_^)/\n \\-|-/\n   |\n   |\n  |+|\n  | |</pre><figcaption class="mono">landing</figcaption></figure><figure><pre class="mono"> (^_^)\n  /|\\\n / | \\\n   |\n  I+I\n  I I</pre><figcaption class="mono">standing</figcaption></figure><figure><pre class="mono">   |>\n  /|\\\n | | |\n   |\n  /|\n / |</pre><figcaption class="mono">walk · frame 2</figcaption></figure><figure><pre class="mono">   |>\n  /|\\\n / | \\\n   |\n  /\\\n /  \\</pre><figcaption class="mono">walk · frame 3</figcaption></figure></div>'
      + '</div></section>',
    highlights: [
      { t: 'Spawn animation', d: 'The player falls from the top of the terminal, frame by frame, and lands arms-up.' },
      { t: 'Walk cycle', d: 'Four hand-placed frames, three columns per step, redrawn on a timer.' },
      { t: 'Title screen', d: 'Type play, settings or exit — the whole UI is typed commands.' },
      { t: 'Settings', d: 'Animation speed at 0.5×, 1× or 2×, and a switch for the loading screen.' },
      { t: 'Loading bar', d: 'A percentage loading screen drawn in ASCII.' },
      { t: 'Gamer tag', d: 'Your name, asked for and remembered for the session.' },
      { t: 'Pause screen', d: 'Type pause at any time.' },
      { t: 'Hash-codes', d: '#action# switches on action mode, #normal# turns it off, #addPlayer# summons a second player.' }
    ],
    install: [
      { label: 'Windows exe', code: '1. Install Java once with the JRE Installer (no admin rights)\n2. Download Terminal-Game from the releases page\n3. Run Terminal Game.exe — best in Windows Terminal' },
      { label: 'BlueJ (original)', code: 'Open Terminal_game2_basic.java in BlueJ\nRight-click the class → void main(String[] args)' },
      { label: 'Any JDK', code: 'javac Terminal_game2_basic.java\njava Terminal_game2_basic' }
    ],
    installNote: 'It was written for the BlueJ terminal, where \\u000C clears the screen. The exe adds a tiny launcher that turns that character into a standard clear-screen code — the game’s own code is untouched.',
    build: [['Written in', 'BlueJ, November 2023'], ['Structure', 'One class, one main() method'], ['Rendering', 'Nested do-while and for loops printing spaces and slashes'], ['Timing', 'Thread.sleep between frames'], ['Clearing', 'System.out.print("\\u000C")']]
  },
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
