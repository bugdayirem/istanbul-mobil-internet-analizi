import base64
import json
from pathlib import Path

root = Path(__file__).resolve().parents[1]
files = {
    'index.html': 'text/html; charset=utf-8',
    'style.css': 'text/css; charset=utf-8',
    'app.js': 'text/javascript; charset=utf-8',
    'sw.js': 'text/javascript; charset=utf-8',
    'data.json': 'application/json; charset=utf-8',
    'manifest.webmanifest': 'application/manifest+json',
    'icons/icon.svg': 'image/svg+xml',
    'icons/icon-192.png': 'image/png',
    'icons/icon-512.png': 'image/png'
}
assets = {'/' + name: {'type': mime, 'body': base64.b64encode((root / name).read_bytes()).decode()} for name, mime in files.items()}
assets['/'] = assets['/index.html']
template = (root / 'worker/server-template.js').read_text()
code = template.replace('__RECORDS__', (root / 'data.json').read_text()).replace('__ASSETS__', json.dumps(assets))
(root / 'worker/index.js').write_text(code)
print('Built API worker with PWA assets.')
