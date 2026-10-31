# ClassBoard website

The launch website for [ClassBoard](https://github.com/An0nym0us-glitch/Smart-board), the
open-source digital whiteboard for interactive classroom displays.

It is a plain static site (HTML, CSS and a little JavaScript) with no build step. The colours
follow the app's *Blackboard Dark* theme, and the screenshots and logo come from the app repo.

## Files

```text
index.html       the page: hero, what's new (ribbon size and calculator demos), features, live demos, screenshot tour,
                 touch/shortcuts, download, guides, build, FAQ
styles.css       all styling: blackboard (dark) and whiteboard (light) themes, responsive down to
                 phone width, respects reduced motion
main.js          drawable hero board, live demos (graph, protractor, equation, calculator, ribbon size), Ctrl+K command
                 palette, theme switch, scroll effects, latest-release lookup
guides/          PDFs: "How to use ClassBoard" manual (full and compact, from the app's docs/),
                 the ClassBoard guide in full colour for screens, and its ink-saver edition
assets/img/      app screenshots and guide covers (WebP), logo, social preview image (og.jpg), touch icon
favicon.ico      app icon
robots.txt, sitemap.xml   for search engines
```

The download buttons link straight to the current installer (v0.3.1). When the page loads,
`main.js` asks the GitHub API for the latest release and, if it has a `*Setup*.exe` asset,
points the buttons, version, size and release-notes link at that release instead.

When the app has a new release:

1. In `index.html`, update the installer links, `data-version`, the hero badge, the JSON-LD
   `softwareVersion` / `downloadUrl` and the "What's new" section.
2. Bump the `?v=` on `styles.css` and `main.js` so browsers fetch the new files straight away.
3. Copy the manuals from the app's `docs/` folder into `guides/` if they changed.

## Performance notes

* Screenshots are lossless WebP; the tour preloads them only when it comes near the screen.
* Web fonts (Inter, Caveat) load without blocking the first paint; code uses the system monospace font.
* Animations pause while their section is off screen (`.is-offscreen`), and the JavaScript loops
  (chalk dust, demos) only run while visible.

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
