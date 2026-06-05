# Brand assets

The shared **Brainite** logo exports live in `brainite-exports/` and are
imported directly by the app:

- `AppLogo.tsx` uses `header-logo-transparent.png` (light surfaces),
  `dark-variant-transparent.png` (dark surfaces, `onDark`), and
  `favicon-transparent.png` (mark only).
- The build-brain scene core (`BrainCore.tsx`) uses `favicon-transparent.png`.
- `index.html` favicon uses `favicon.svg` / `favicon-32.png`.
- `slack.png` is the supplied full-color Slack mark used by `SourceIcon`.

All branding is rendered via `<img>` — the app follows a no-inline-SVG rule
for branding and icons.
