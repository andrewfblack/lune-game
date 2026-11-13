#!/usr/bin/env python3
"""Serve only the playable game to another device on the local network.

The archived family chat, docs, source scripts and package files are NEVER
served. Bind to this computer's Wi-Fi address, not to a public interface.
"""

import argparse
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from mimetypes import guess_type
from pathlib import Path
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parent
GAME_FILES = {
    '/': 'index.html',
    '/index.html': 'index.html',
    '/css/style.css': 'css/style.css',
    '/js/content.js': 'js/content.js',
    '/js/episodes/entrance.js': 'js/episodes/entrance.js',
    '/js/game.js': 'js/game.js',
    '/js/dialogue-polish.js': 'js/dialogue-polish.js',
    '/js/scene-art.js': 'js/scene-art.js',
    # Individually reviewed UI art only; do not expose the uploads directory.
    '/assets/ui/slime-castle.webp': 'assets/ui/slime-castle.webp',
    '/assets/ui/moon-key.webp': 'assets/ui/moon-key.webp',
    '/assets/ui/gift.webp': 'assets/ui/gift.webp',
    '/assets/ui/microphone.webp': 'assets/ui/microphone.webp',
    '/assets/ui/slime-machine.webp': 'assets/ui/slime-machine.webp',
    '/assets/ui/smoothie-stand.webp': 'assets/ui/smoothie-stand.webp',
    '/assets/ui/letter.webp': 'assets/ui/letter.webp',
    '/assets/ui/moon-lock-key.webp': 'assets/ui/moon-lock-key.webp',
    '/assets/ui/moon-lock.webp': 'assets/ui/moon-lock.webp',
    '/assets/ui/moon-cookie.webp': 'assets/ui/moon-cookie.webp',
    '/assets/ui/star.webp': 'assets/ui/star.webp',
    '/assets/ui/clapperboard.webp': 'assets/ui/clapperboard.webp',
    '/assets/ui/lifebuoy.webp': 'assets/ui/lifebuoy.webp',
    '/assets/ui/home.webp': 'assets/ui/home.webp',
    '/assets/ui/settings.webp': 'assets/ui/settings.webp',
    '/js/episodes/moonpalace.js': 'js/episodes/moonpalace.js',
    '/js/episodes/first-ah.js': 'js/episodes/first-ah.js',
    '/js/episodes/moon-key.js': 'js/episodes/moon-key.js',
    '/js/episodes/captain-duckula.js': 'js/episodes/captain-duckula.js',
    '/js/episodes/hug-alarm.js': 'js/episodes/hug-alarm.js',
    '/js/episodes/royal-dare.js': 'js/episodes/royal-dare.js',
    '/js/episodes/bworple-castle.js': 'js/episodes/bworple-castle.js',
    '/assets/characters/masked-visitor.svg': 'assets/characters/masked-visitor.svg',
    '/assets/characters/space-courier.svg': 'assets/characters/space-courier.svg',
    '/assets/bg/laboratory.svg': 'assets/bg/laboratory.svg',
    '/assets/characters/momo-star.svg': 'assets/characters/momo-star.svg',
    '/assets/characters/coco.svg': 'assets/characters/coco.svg',
    '/assets/characters/moon-visitor.svg': 'assets/characters/moon-visitor.svg',
    '/assets/characters/duckula.svg': 'assets/characters/duckula.svg',
    '/assets/characters/cookie-guard.svg': 'assets/characters/cookie-guard.svg',
    '/assets/characters/luka-placeholder.svg': 'assets/characters/luka-placeholder.svg',
    '/assets/characters/ryan.svg': 'assets/characters/ryan.svg',
    '/assets/characters/dave.svg': 'assets/characters/dave.svg',
    '/assets/characters/jack.svg': 'assets/characters/jack.svg',
    '/assets/characters/jake.svg': 'assets/characters/jake.svg',
    '/assets/characters/animiguchi.svg': 'assets/characters/animiguchi.svg',
    '/js/episodes/duckdom.js': 'js/episodes/duckdom.js',
    '/js/episodes/duckdom-story.js': 'js/episodes/duckdom-story.js',
    '/js/episodes/dares.js': 'js/episodes/dares.js',
    '/js/episodes/pillowfort.js': 'js/episodes/pillowfort.js',
    '/js/episodes/workshop.js': 'js/episodes/workshop.js',
    '/js/episodes/workshop-story.js': 'js/episodes/workshop-story.js',
    '/js/episodes/slimmarchives.js': 'js/episodes/slimmarchives.js',
    '/js/episodes/slimmarchives-story.js': 'js/episodes/slimmarchives-story.js',
    '/js/episodes/bworplevoice.js': 'js/episodes/bworplevoice.js',
    '/js/episodes/bworplevoice-story.js': 'js/episodes/bworplevoice-story.js',
    '/js/episodes/miku-cover.js': 'js/episodes/miku-cover.js',
    '/js/episodes/karmacam.js': 'js/episodes/karmacam.js',
    '/js/episodes/karmacam-story.js': 'js/episodes/karmacam-story.js',
    '/js/episodes/baguettecrisis.js': 'js/episodes/baguettecrisis.js',
    '/js/episodes/baguettecrisis-story.js': 'js/episodes/baguettecrisis-story.js',
    '/js/episodes/secret-room-story.js': 'js/episodes/secret-room-story.js',
}
IMAGE_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.webp'}


def allowed_file(url_path):
    path = unquote(urlsplit(url_path).path)
    relative = GAME_FILES.get(path)
    if relative is None:
        # Explicitly allow image files in these two art folders, nothing else.
        parts = path.lstrip('/').split('/')
        if (len(parts) != 3 or parts[0] != 'assets'
                or parts[1] not in {'characters', 'bg', 'ui'}
                or not parts[2].isascii()
                or not all(c.isalnum() or c in '._-' for c in parts[2])
                or Path(parts[2]).suffix.lower() not in IMAGE_EXTENSIONS):
            return None
        relative = '/'.join(parts)

    file = (ROOT / relative).resolve()
    if not file.is_relative_to(ROOT) or not file.is_file():
        return None
    return file


class GameHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.serve_file(send_body=True)

    def do_HEAD(self):
        self.serve_file(send_body=False)

    def serve_file(self, send_body):
        file = allowed_file(self.path)
        if file is None:
            self.send_error(404, 'Game file not found')
            return
        data = file.read_bytes()
        mime = guess_type(file.name)[0] or 'application/octet-stream'
        self.send_response(200)
        self.send_header('Content-Type', mime + ('; charset=utf-8' if mime.startswith('text/') or mime == 'application/javascript' else ''))
        self.send_header('Content-Length', str(len(data)))
        self.send_header('Cache-Control', 'no-cache')
        self.send_header('X-Content-Type-Options', 'nosniff')
        self.end_headers()
        if send_body:
            self.wfile.write(data)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--host', default='127.0.0.1', help='Computer Wi-Fi IP (default: localhost only)')
    parser.add_argument('--port', type=int, default=8472)
    args = parser.parse_args()
    with ThreadingHTTPServer((args.host, args.port), GameHandler) as server:
        print(f'Game only: http://{args.host}:{args.port}/', flush=True)
        server.serve_forever()
