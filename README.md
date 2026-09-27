# ishanmalu.dev

Personal site: **Side quests.** A list of the software I build for myself.

Plain HTML, CSS and JS. No build step and no dependencies apart from Google Fonts.

- `index.html` holds all the content, including each project's description, links and colour as `data-` attributes on its row, so the page reads fine without JS.
- `app.js` adds the motion: the dot-grid spotlight, the headline letters, the hover preview, and the project view (`/#seedscape` deep-links to it).
- `styles.css` holds the styles.

## Adding a project

Copy one `<li>` in `index.html` and change its `data-` attributes. `data-links` is `Label|url;Label|url` (leave it empty for no buttons). `data-status="soon"` shows a Coming soon badge. Add a matching animation to `G` in `app.js`, keyed by `data-k`.

## Run locally

```
python3 -m http.server 8140
```

Deployed on Vercel as a static site.
