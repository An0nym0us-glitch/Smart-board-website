# ClassBoard website

The launch website for [ClassBoard](https://github.com/An0nym0us-glitch/Smart-board), the
open-source digital whiteboard for interactive classroom displays.

It is a plain static site (HTML, CSS and a little JavaScript) with no build step. The colours
follow the app's *Blackboard Dark* theme, and the screenshots and logo come from the app repo.

## Files

```text
index.html       the page: hero, what's new (calculator demo), features, live demos, screenshot tour,
                 touch/shortcuts, download, guides, build, FAQ
styles.css       all styling: blackboard (dark) and whiteboard (light) themes, responsive down to
                 phone width, respects reduced motion
main.js          drawable hero board, live demos (graph, protractor, equation, calculator), Ctrl+K command
                 palette, theme switch, scroll effects, latest-release lookup
guides/          PDFs: "How to use ClassBoard" manual (full and compact, from the app's docs/),
                 the ClassBoard guide in full colour for screens, and its ink-saver edition
assets/img/      app screenshots, logo and guide cover thumbnails
favicon.ico      app icon
```

The download buttons link straight to the current installer (v0.3.0). When the page loads,
`main.js` asks the GitHub API for the latest release and, if it has a `*Setup*.exe` asset,
points the buttons, version, size and release-notes link at that release instead.

When the app has a new release, update the hard-coded v0.3.0 links and the "What's new"
section in `index.html`, and copy the manuals from the app's `docs/` folder into `guides/`.

## Preview locally

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

## Publish with GitHub Pages

1. Merge this into `main`.
2. In the repo go to **Settings → Pages** and set **Source** to **GitHub Actions**.
3. The `Deploy website to GitHub Pages` workflow publishes the site on every push to `main`
   (or run it by hand from the Actions tab).

The site will be live at `https://an0nym0us-glitch.github.io/Smart-board-website/`.
