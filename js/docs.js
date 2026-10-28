/* Per-project documentation: controls, step-by-step guides, the files each app reads and
   writes, use cases and FAQs. Facts come from each app's source. Rendered into
   projects/<id>/docs.html by tools/build-pages.js (with js/structure.js and js/releases.js).

   Fields (all optional):
     controls  [{ keys, action }]           — keyboard / mouse
     controlsTitle                          — heading for that table (default "Controls")
     guide     [{ t, d }]                   — numbered how-to steps
     files     [{ name, d }]                — files the app reads/writes next to its exe
     usecases  [{ t, d }]                   — "perfect for"
     faq       [{ q, a }]
     notes     [paragraphs]                 — extra docs text
     site      { label, href }              — the project's own website, if it has one       */
window.DOCS = {
  'rex-run': {
    controls: [
      { keys: 'Space', action: 'Jump' },
      { keys: 'Shift', action: 'Flip gravity — run on the ceiling, then flip back' },
      { keys: 'Enter', action: 'Pause — opens resume, shop, settings and exit' },
      { keys: 'Mouse', action: 'Menus, shop and the avatar editor' }
    ],
    guide: [
      { t: 'Start a run', d: 'Click “Click to start the game”. Rex starts running on his own; the score climbs with distance.' },
      { t: 'Survive', d: 'Jump over stone blocks and pillars with Space. When the floor gets dangerous, Shift flips gravity and Rex runs on the ceiling.' },
      { t: 'Collect', d: 'Grab coins for the shop and hearts for extra lives; a shield power-up absorbs a hit.' },
      { t: 'Spend', d: 'Press Enter to pause, open the shop and spend your coins.' },
      { t: 'Make Rex yours', d: 'Edit Avatar on the title screen or the pause menu changes how Rex looks.' }
    ],
    files: [
      { name: 'objects/', d: 'Coins, hearts, shields, blocks, pillars and the shop art' },
      { name: 'sprites/', d: 'Rex’s avatars' },
      { name: 'Saves.txt', d: 'Your coins and progress — written as you play, so keep the folder writable' }
    ],
    usecases: [{ t: 'Five-minute breaks', d: 'One more run, then back to work.' }, { t: 'Learning game loops', d: 'A readable, hand-written Swing game loop to study.' }],
    faq: [
      { q: 'My coins reset.', a: 'Saves.txt sits next to the exe. If the folder is read-only (e.g. inside Program Files), the game can’t save — unzip it to Desktop or Documents.' },
      { q: 'What does Shift do?', a: 'It flips gravity. Rex runs upside-down along the ceiling until you flip it back.' }
    ]
  },
  'flying-dual': {
    controls: [
      { keys: 'W A S D', action: 'Player 1 — fly' },
      { keys: 'Ctrl', action: 'Player 1 — fire' },
      { keys: '↑ ← ↓ →', action: 'Player 2 — fly' },
      { keys: 'Enter', action: 'Player 2 — fire (and confirm on the menus)' }
    ],
    guide: [
      { t: 'Start', d: 'Click Start on the title screen.' },
      { t: 'Name the pilots', d: 'Type both players’ names and press Continue.' },
      { t: 'Pick a difficulty', d: 'Choose from the dropdown and press Continue.' },
      { t: 'Fly', d: 'Each hit drains the other player’s health bar at the top. Win before the round timer runs out.' }
    ],
    files: [{ name: 'images/', d: 'The window icon' }],
    usecases: [{ t: 'Two people, one laptop', d: 'No controllers, no network — just the keyboard.' }],
    faq: [{ q: 'Both players are on one keyboard?', a: 'Yes — Player 1 on the left (WASD + Ctrl), Player 2 on the right (arrows + Enter).' }]
  },
  'ping-pong': {
    controls: [
      { keys: 'W / S', action: 'Left paddle up / down' },
      { keys: '↑ / ↓', action: 'Right paddle up / down' },
      { keys: 'Space', action: 'Pause / resume' },
      { keys: 'Enter', action: 'Move to the next name field on the start screen' }
    ],
    guide: [
      { t: 'Name the players', d: 'Type both names and press Continue.' },
      { t: 'Choose colours', d: 'Settings let you recolour the ball, each paddle and the background.' },
      { t: 'Play', d: 'Keep the ball in. The score for each side sits at the top; the game-over screen tells a win from a draw.' }
    ],
    files: [{ name: 'images/', d: 'The window icon' }],
    faq: [{ q: 'Can I play against the computer?', a: 'No — it’s built for two people on one keyboard.' }]
  },
  'notes': {
    controlsTitle: 'Keyboard shortcuts',
    controls: [
      { keys: 'Ctrl + N', action: 'New file' }, { keys: 'Ctrl + Shift + N', action: 'New window' },
      { keys: 'Ctrl + O', action: 'Open' }, { keys: 'Ctrl + S', action: 'Save' }, { keys: 'Ctrl + Shift + S', action: 'Save as' },
      { keys: 'Ctrl + Z / Ctrl + Y', action: 'Undo / redo' }, { keys: 'Ctrl + X / C / V', action: 'Cut / copy / paste' },
      { keys: 'Ctrl + F', action: 'Find (next / previous)' }, { keys: 'Ctrl + H', action: 'Replace / replace all' },
      { keys: 'Ctrl + G', action: 'Go to line' }, { keys: 'Ctrl + A', action: 'Select all' },
      { keys: 'Ctrl + Shift + D', action: 'Insert time and date' },
      { keys: 'Ctrl + = / Ctrl + −', action: 'Bigger / smaller text' }
    ],
    guide: [
      { t: 'Write', d: 'It works like Notepad: type, open and save plain .txt files.' },
      { t: 'Theme one file', d: 'Design → Change Current File Background / Text Color gives just this file its own colours.' },
      { t: 'Theme everything', d: 'Design → Change Universal Background / Text Color restyles every file at once.' },
      { t: 'Use a picture', d: 'Design → Set Image As Background puts an image behind your text.' },
      { t: 'Lock a file', d: 'Privacy → Enable Encryption saves the file scrambled; Decrypt Current File turns it back.' },
      { t: 'Back up', d: 'Privacy → Enable Backup and Backup Directory keep copies in a folder you choose.' },
      { t: 'Write Java', d: 'The Dev menu compiles and runs the Java file you have open.' }
    ],
    files: [
      { name: 'saves.txt', d: 'Your theme, colours and font — remembered between launches' },
      { name: 'res/', d: 'The Consolas font and icon' }
    ],
    notes: ['The encryption in Notes is a cipher I wrote myself: every character is transformed with a random seed. It keeps casual eyes off a file — it is obfuscation, not cryptographic security, so don’t use it for anything that truly matters. (Notes+, its successor, uses AES-256-GCM.)'],
    faq: [
      { q: 'Is the encryption secure?', a: 'It’s a home-made, seeded character cipher — good against a casual glance, not against a determined attacker.' },
      { q: 'Where are my settings?', a: 'In saves.txt next to the exe.' }
    ]
  },
  'sg-paint': {
    controlsTitle: 'Tools',
    controls: [
      { keys: 'Pencil', action: 'Freehand drawing' }, { keys: 'Fill', action: 'Flood-fill an area' }, { keys: 'Eraser', action: 'Erase' },
      { keys: 'Shapes', action: 'Rectangles, rounded rectangles, ellipses, triangles, lines — outlined or filled' },
      { keys: 'Stroke', action: 'Line thickness' }, { keys: 'Swatches + ✚', action: 'Pick a colour or open the custom colour picker' },
      { keys: 'Resize', action: 'Width/height fields plus arrow nudges; Enter applies' },
      { keys: 'New / Open / Save As', action: 'Native file dialogs' }
    ],
    guide: [
      { t: 'Pick a colour', d: 'Click a swatch, or ✚ for any custom colour.' },
      { t: 'Pick a tool', d: 'Pencil, fill, eraser or one of the shapes. Choose outlined or filled shapes.' },
      { t: 'Draw', d: 'Click and drag on the canvas.' },
      { t: 'Resize', d: 'Type a width and height, or use the arrows, and press Enter.' },
      { t: 'Save', d: 'Save As writes your picture as an image file.' }
    ],
    files: [{ name: 'res/', d: 'Tool icons' }]
  },
  'jre-installer': {
    guide: [
      { t: 'Unzip', d: 'Unzip the download. Keep JRE Installer.exe and the JRE folder together.' },
      { t: 'Run', d: 'Run JRE Installer.exe. It runs on the Java it carries, so the PC needs nothing beforehand.' },
      { t: 'Install', d: 'Click Start Installing JRE and watch the percentage.' },
      { t: 'Done', d: 'Java now lives in %LOCALAPPDATA%\\OpenJDK Adoptium JRE - SG\\JRE, and every one of my apps finds it automatically.' }
    ],
    files: [{ name: 'JRE/', d: 'The bundled Eclipse Temurin 21 LTS runtime it installs' }],
    notes: ['Every exe I publish is built with Launch4j and searches for Java in this order: %LOCALAPPDATA%\\OpenJDK Adoptium JRE - SG\\JRE, then %JAVA_HOME%. Install once here and all of them just work.'],
    faq: [
      { q: 'Does it need admin rights?', a: 'No. It writes only inside your own user profile.' },
      { q: 'Can I run it again?', a: 'Yes — it offers Reinstall. The new copy is built in a separate folder and swapped in only once it’s complete.' },
      { q: 'How do I uninstall?', a: 'Delete the folder %LOCALAPPDATA%\\OpenJDK Adoptium JRE - SG.' }
    ]
  },
  'flappy-bird': {
    controls: [{ keys: 'Space', action: 'Flap' }, { keys: 'Mouse', action: 'The ▶ button starts a new game' }],
    guide: [{ t: 'Start', d: 'Click ▶.' }, { t: 'Flap', d: 'Tap Space to rise; gravity does the rest.' }, { t: 'Beat your best', d: 'Your high score is shown top-left and saved.' }],
    files: [{ name: 'res/', d: 'Bird, pipes, background and font' }, { name: 'res/saves.txt', d: 'Your high score' }]
  },
  'memo': {
    controls: [{ keys: 'Mouse', action: 'Start, then click the colours in the order they lit up' }],
    guide: [{ t: 'Start', d: 'Click Start! in the centre.' }, { t: 'Watch', d: 'A colour lights up; each round adds one more to the sequence.' }, { t: 'Repeat', d: 'Click the colours back in the same order. One mistake ends the game.' }],
    files: [{ name: 'res/saves.txt', d: 'Your high score' }]
  },
  'color-picker': {
    guide: [{ t: 'Pick', d: 'Click Change Colour and choose any colour.' }, { t: 'Copy', d: 'Each of RGB, HEX and HSB has its own Copy button.' }, { t: 'Paste', d: 'The code is on your clipboard, ready for CSS, design tools or code.' }],
    usecases: [{ t: 'Web & UI work', d: 'Grab a HEX for CSS or an HSB for design tools.' }]
  },
  'tic-tac-toe': {
    controls: [{ keys: 'Mouse', action: 'Click a square to play' }, { keys: 'Restart', action: 'Clear the board' }, { keys: 'Reset', action: 'Clear the scoreboard too' }],
    guide: [{ t: 'Play', d: 'X and O take turns clicking squares.' }, { t: 'Keep score', d: 'The scoreboard records ten rounds.' }]
  },
  'terminal-game': {
    controlsTitle: 'Commands',
    controls: [
      { keys: 'play', action: 'Start the game (title screen)' }, { keys: 'setings', action: 'Open settings (spelled as in the original)' },
      { keys: 'exit', action: 'Quit — at any time except during an animation' }, { keys: 'speed', action: 'Animation speed: slow, normal or fast' },
      { keys: 'loading', action: 'Turn the loading screen on or off' }, { keys: 'info', action: 'Every command, explained' },
      { keys: 'a number', action: 'Walk to that column' }, { keys: 'pause / restart', action: 'Pause screen / start over from the top' },
      { keys: '#action#  #normal#', action: 'Action mode on / off' }, { keys: '#addPlayer#', action: 'Summon a second player' }
    ],
    guide: [
      { t: 'Start', d: 'Type play and enter a gamer tag.' },
      { t: 'Watch him land', d: 'The (^_^) falls from the top of the terminal and lands at column 30.' },
      { t: 'Walk', d: 'Type a number (not 30) and he walks there, three columns per step.' }
    ],
    faq: [{ q: 'The screen doesn’t clear in my console.', a: 'The game clears the screen with \\u000C, which BlueJ understands. Use the exe (which translates it) in Windows Terminal, or run it in BlueJ.' }]
  },
  'widgets': {
    controls: [{ keys: 'Drag', action: 'Move a widget anywhere — it remembers where' }, { keys: 'Edit', action: 'Weather and Mix: change the city' }, { keys: 'Control panel', action: 'Clock: recolour, move, resize, add or remove' }],
    files: [{ name: 'weather.properties', d: 'apiKey and city for the Weather and Mix widgets' }, { name: 'widget.properties', d: 'The widget’s last position (written automatically)' }, { name: 'res/', d: 'Fonts and weather art' }],
    faq: [{ q: 'The weather says “not available”.', a: 'Put a free WeatherAPI key in weather.properties next to the exe, and check the city name.' }]
  },
  'jctx': {
    guide: [{ t: 'Install', d: 'pip install jctx' }, { t: 'Run', d: 'Jctx "path/to/project" — context.txt appears in the project folder.' }, { t: 'Paste', d: 'Paste it into any AI chat, then ask your question.' }],
    files: [{ name: 'context.txt / context.md', d: 'The generated context, in your project root' }, { name: '.jctxignore', d: 'Your own exclusions, one pattern per line' }],
    usecases: [{ t: 'AI pair-programming', d: 'Give the model the whole architecture, not one file.' }, { t: 'Onboarding', d: 'A one-file map of any Java, Kotlin or Python codebase.' }],
    faq: [{ q: 'Does it upload my code?', a: 'No. It runs locally and only writes a file.' }, { q: 'What does it skip?', a: 'build/, target/, .git/, node_modules/, .gradle/, .idea/ and compiled files — plus anything in .jctxignore.' }]
  },
  'codemeter': {
    guide: [{ t: 'Install', d: 'Homebrew, Winget, Scoop, Nix or the JAR — see Download.' }, { t: 'Scan', d: 'codemeter scan . in any project.' }, { t: 'Explore', d: 'history, compare, milestones and wrapped show how it grows.' }, { t: 'Share', d: 'codemeter export -f png -o report.png' }],
    usecases: [{ t: 'Your year in code', d: 'codemeter wrapped at the end of the year.' }, { t: 'CI dashboards', d: 'codemeter stats emits script-friendly numbers.' }]
  },
  'nglobe': {
    guide: [{ t: 'Install', d: 'Clone the repo and pip install .' }, { t: 'Start', d: 'nglobe start — the wizard sets up the certificate, proxy and GeoIP database.' }, { t: 'Watch', d: 'Open the globe in your browser and use your machine as normal.' }],
    faq: [{ q: 'Why does it need a certificate?', a: 'To show HTTPS requests, mitmproxy must decrypt them locally — only on your own machine.' }]
  },
  'expenses': { site: { label: 'expenses.talken.in', href: 'https://expenses.talken.in' } },
  'backbench': {},
  'drive-handler': {
    notes: ['Tokens are plain strings the app stores itself, so the library never decides where secrets live. Every call that can fail throws a DriveException with a reason — wrap calls in DriveRetry.run to retry only what waiting can fix.']
  }
};
