# ClassBoard website

The launch website for [ClassBoard](https://github.com/An0nym0us-glitch/Smart-board), the
open-source digital whiteboard for interactive classroom displays.

It is a plain static site (HTML, CSS and a little JavaScript) with no build step. The colours
follow the app's *Blackboard Dark* theme, and the screenshots and logo come from the app repo.

## Files

```text
index.html       the page: hero, features, screenshot tour, touch/shortcuts, download, build, FAQ
styles.css       all styling (responsive down to phone width, respects reduced motion)
main.js          mobile menu, screenshot tabs, copy button, scroll reveal, latest-release lookup
assets/img/      app screenshots and logo (from Smart-board/docs/images and resources/app)
favicon.ico      app icon
```

The download buttons point at the app's latest GitHub release page. When the page loads,
`main.js` asks the GitHub API for the latest release, shows its version in the hero badge and,
if the release has a `*Setup*.exe` asset, links the buttons straight to that installer.

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
