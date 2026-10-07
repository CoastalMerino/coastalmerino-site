# coastalmerino-site

The Coastal Merino website (coastalmerino.com). Plain static HTML on Netlify, no framework.

## Branches
- `dev` → preview at https://dev--coastalmerino.netlify.app (free, deploy as often as you like)
- `main` → the live site. Merging dev into main is one production deploy (15 Netlify credits).

## Editing
Pages live in `src/pages/`, shared pieces (header, footer, FAQ, standards) in `src/partials/`,
styles in `assets/site.css`, script in `assets/site.js`. After any change run:

    python3 build.py

That rebuilds the .html files at the repo root, makes resized photo copies in `images/r/`,
minifies the CSS, and prints a pre-launch checklist. Commit everything it produces.

## Before going live
The checklist at the end of `build.py` must show 0 TBDs and 0 stock photos on every page.
- TBD = a decision still open, marked on the page with a dashed amber tag.
- stock = an Unsplash placeholder photo (`data-stock="unsplash"`). See `images/README.md`.

## Other
- `tools/og.html` is the source of `og-image.png` (link previews); see `tools/render-og.js`.
- Email signups post to Kit form 9974631 (`assets/site.js`).
