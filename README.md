# Lune: Legend of the Pillow Fort

A kid-friendly browser-based story adventure.

## Play

Open `index.html` in a browser, or publish this folder with GitHub Pages. There is
no build step and no runtime dependencies. Progress is saved in the browser with
`localStorage`.

## Phone at home

```bash
python3 serve_phone.py --host YOUR_WIFI_OR_TAILSCALE_IP --port 8472
# then open http://YOUR_WIFI_OR_TAILSCALE_IP:8472/
```

Notes:

- The phone server only serves playable game files.
- This public archive deliberately excludes private family notes, source archives,
  tests, dependencies, and generation scripts.
- Complete the story in the browser to unlock Free Play, a separate, just-for-fun
  adventure mode.
