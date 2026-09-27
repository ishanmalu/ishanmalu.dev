# ishanmalu.dev

**Side quests.** Stuff I built when I should have been doing the main quest.

Plain HTML, CSS and JS with no build step. The page opens on the headline, and scrolling draws a quest line that lights up each project in turn.

- `index.html` holds all the content. Each project's description, links and colour live as `data-` attributes on its row, so the page reads fine without JS.
- `app.js` adds the motion: the dot-grid spotlight, the headline letters, the scroll story, the hover preview and the project view.
- `styles.css` holds the styles.
- `vendor/lenis.min.js` is [Lenis](https://github.com/darkroom-engineering/lenis) 1.3.26 (MIT, see `vendor/LICENSE-lenis`), used for smooth scrolling. It's served from this site rather than a CDN.
- `vercel.json` turns on clean URLs (`/seedscape`) and the security headers. `index.html` repeats the content security policy as a meta tag, so it also applies locally.

## Project pages

Every project has its own address, for example `ishanmalu.dev/seedscape`. `seedscape.html` and the others are generated copies of `index.html` with their own title, description and canonical URL. `app.js` reads the address and opens that project. Old `/#seedscape` links still work.

After editing `index.html`, regenerate the pages and `sitemap.xml`:

```
python3 scripts/pages.py
```

## Adding a project

Copy one `<li>` in `index.html` and change its `href` and `data-` attributes:

- `data-links` is `Label|url;Label|url`. Leave it empty for no buttons.
- `data-status="soon"` shows a Coming soon badge.

Add a matching animation to `G` in `app.js`, keyed by `data-k`. Then run `scripts/pages.py`.

## Share image

`og.png` comes from `scripts/og.py`, which needs Pillow and the Bricolage Grotesque variable font from [google/fonts](https://github.com/google/fonts/tree/main/ofl/bricolagegrotesque):

```
python3 scripts/og.py "BricolageGrotesque[opsz,wdth,wght].ttf"
```

## Run locally

```
npx serve .
```

`serve` handles the clean project URLs. `python3 -m http.server` works too, but only for the home page.

Deployed on Vercel. Every push to `main` goes live.
