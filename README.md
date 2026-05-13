# BuildCrew.AI — Prototype

A clickable, hi-fi prototype for the BuildCrew.AI preconstruction workspace. Built as static HTML/CSS/JSX (React via CDN + Babel-standalone, no build step).

**Live demo:** _enable GitHub Pages on this repo — see below._

## Run locally

```bash
# from the repo root
python3 -m http.server 8000
# then open http://localhost:8000
```

Any static server works. Just open `index.html`.

## What's in here

- `index.html` — app shell + React mount
- `app.css` — all styles
- `data.js` — mock data (projects, drawings, skills, runs, files, etc.)
- `components.jsx` — shared components (NavRail, AIAssistant, ContextMenu, etc.)
- `screens-1.jsx` — Home, Projects
- `screens-2.jsx` — Project Home, Files
- `screens-3.jsx` — Skill results (ROM Estimate, Clarifications, Bid Level Analysis)
- `screens-4.jsx`, `screens-modals.jsx`, `screens-tabs.jsx`, `tweaks-panel.jsx` — supporting screens / modals / tabs
- `design-system/` — brand assets and color tokens
- `uploads/` — sample images

JSX is compiled in the browser by Babel-standalone, so any syntax errors will surface in the DevTools console rather than at build time.

## Sharing with the team

After pushing to GitHub:

1. Repo → **Settings** → **Pages**
2. Source: **Deploy from a branch** · Branch: **main** · Folder: **/ (root)**
3. Save. Pages will publish at `https://<your-username>.github.io/<repo-name>/`.

Pages typically takes 1-2 minutes on first deploy.
