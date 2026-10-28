"""Scans each project's real source tree and writes js/structure.js — the "Project structure"
section of every project's docs page (files, line counts, what each one declares).

Small projects list every file; big ones are summarised per folder.
Run from the repo root:  python -I tools/structure.py   (needs the local project folders)"""
import json, os, re

P = r'D:\User\Data\projects'
PUB = os.path.join(P, 'Published')
CODE = ('.java', '.kt', '.py', '.js', '.ts', '.tsx', '.jsx')
SKIP = {'node_modules', 'build', 'target', 'out', 'dist', '.git', '.gradle', '.idea', '.next', '__pycache__',
        'venv', '.venv', 'site-packages', 'test', 'tests', 'doc', 'res', 'assets', 'public', 'data', 'Releases',
        'jctx.egg-info', 'scratch', 'generated'}

# id -> (folder, mode) ; mode 'files' lists files, 'folders' summarises subfolders of the given root
PROJECTS = {
    'rex-run': ('Published/Rex-Run', 'files'), 'flying-dual': ('Published/Flying-Dual', 'files'),
    'ping-pong': ('Published/Ping-Pong', 'files'), 'notes': ('Published/Notes', 'files'),
    'sg-paint': ('Published/SG-Paint', 'files'), 'jre-installer': ('Published/JRE-Installer', 'files'),
    'flappy-bird': ('Published/Flappy-Bird', 'files'), 'memo': ('Published/Memo', 'files'),
    'color-picker': ('Published/Color-Picker', 'files'), 'tic-tac-toe': ('Published/Tic-Tac-Toe', 'files'),
    'terminal-game': ('Published/Terminal-Game', 'files'), 'widgets': ('Published/Widgets', 'branches'),
    'jctx': ('Jctx', 'files'), 'photos-utility': ('Photos Utility/src/main/java', 'files'),
    'talken-toolkit': ('Talken Toolkit 2/src/main/java', 'files'), 'cps-tester': ('CPS', 'files'),
    'floating-keyboard': ('Floating Keyboard', 'files'),
    'drive-handler': ('Test_Trials_Gradle', 'tree'), 'codemeter': ('CodeMeter/src/main/java', 'tree'),
    'expenses': ('Expenses/app/src/main/java', 'tree'), 'life': ('Life/app/src/main/java', 'tree'),
    'backbench': ('Backbench/src', 'folders'), 'workdesk': ('Workdesk/src', 'folders'),
    'nglobe': ('NetworkGlobe', 'folders'), 'talken-rest-api': ('Talken-REST-API/src/main/java', 'tree'),
}


def declares(path):
    try:
        src = open(path, encoding='utf-8', errors='ignore').read()
    except OSError:
        return ''
    m = re.search(r'\b(?:public\s+|abstract\s+|final\s+|data\s+|sealed\s+|open\s+)*(class|interface|enum|object|record)\s+(\w+)(?:\s+extends\s+(\w+))?', src)
    if m:
        return f'{m.group(1)} {m.group(2)}' + (f' extends {m.group(3)}' if m.group(3) else '')
    if path.endswith('.py'):
        n = len(re.findall(r'^def \w+', src, re.M))
        return f'{n} functions' if n else 'script'
    return ''


def lines(path):
    try:
        return sum(1 for _ in open(path, encoding='utf-8', errors='ignore'))
    except OSError:
        return 0


def walk_code(root):
    for base, dirs, files in os.walk(root):
        dirs[:] = [d for d in dirs if d not in SKIP and not d.startswith('.')]
        for f in files:
            if f.endswith(CODE) and not f.endswith('.min.js') and f != 'module-info.java':
                yield os.path.join(base, f)


def files_mode(root):
    out = []
    for f in sorted(os.listdir(root)):
        full = os.path.join(root, f)
        if os.path.isfile(full) and f.endswith(CODE) and f != 'module-info.java':
            out.append({'name': f, 'lines': lines(full), 'kind': declares(full)})
        elif os.path.isdir(full) and f not in SKIP and not f.startswith('.'):
            for sub in walk_code(full):
                out.append({'name': os.path.relpath(sub, root).replace('\\', '/'), 'lines': lines(sub), 'kind': declares(sub)})
    return sorted(out, key=lambda x: -x['lines'])


def tree_mode(root):
    """Group by package folder; list files for small packages."""
    groups = {}
    for f in walk_code(root):
        rel = os.path.relpath(os.path.dirname(f), root).replace('\\', '/')
        groups.setdefault(rel, []).append(f)
    common = os.path.commonpath([os.path.relpath(k, '.') for k in groups] or ['.']) if len(groups) > 1 else ''
    out = []
    for g, fs in sorted(groups.items(), key=lambda kv: -sum(lines(x) for x in kv[1])):
        label = g[len(common):].strip('/') if common and g.startswith(common) else g
        out.append({'name': (label or '(root)') + '/', 'lines': sum(lines(x) for x in fs), 'kind': f'{len(fs)} files',
                    'files': [os.path.basename(x) for x in sorted(fs, key=lambda x: -lines(x))[:8]]})
    return out


def folders_mode(root):
    out = []
    for d in sorted(os.listdir(root)):
        full = os.path.join(root, d)
        if os.path.isdir(full) and d not in SKIP and not d.startswith('.'):
            fs = list(walk_code(full))
            if fs:
                out.append({'name': d + '/', 'lines': sum(lines(x) for x in fs), 'kind': f'{len(fs)} files'})
        elif os.path.isfile(full) and d.endswith(CODE):
            out.append({'name': d, 'lines': lines(full), 'kind': declares(full)})
    return sorted(out, key=lambda x: -x['lines'])


result = {}
for pid, (folder, mode) in PROJECTS.items():
    root = os.path.join(P, folder)
    if not os.path.isdir(root):
        continue
    if mode == 'files':
        result[pid] = files_mode(root)
    elif mode == 'tree':
        result[pid] = tree_mode(root)
    elif mode == 'folders':
        result[pid] = folders_mode(root)
    elif mode == 'branches':
        result[pid] = [{'name': b + ' branch', 'lines': sum(e['lines'] for e in files_mode(os.path.join(root, b))),
                        'kind': ', '.join(e['name'] for e in files_mode(os.path.join(root, b)))} for b in ('weather', 'clock', 'mix')]
    total = sum(e['lines'] for e in result[pid])
    print(f'{pid:18s} {len(result[pid]):3d} entries  {total:7d} lines')

out = os.path.join(os.path.dirname(__file__), '..', 'js', 'structure.js')
with open(out, 'w', encoding='utf-8') as fh:
    fh.write('/* Generated by tools/structure.py from the real source trees — do not edit by hand. */\n')
    fh.write('window.STRUCTURE = ' + json.dumps(result, indent=1, ensure_ascii=False) + ';\n')
