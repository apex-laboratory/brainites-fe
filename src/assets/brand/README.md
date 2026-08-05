# Brand assets

The shared **Brainite** logo exports live in `brainite-exports/` and are
imported directly by the app:

- `AppLogo.tsx` uses `header-logo-transparent.png` (light surfaces),
  `dark-variant-transparent.png` (dark surfaces, `onDark`), and
  `favicon-transparent.png` (mark only) / `mark-dark-transparent.png`
  (mark only on a dark surface).
- `mark-dark-transparent.png` is **derived**, not a designer export: it is the
  cream node mark cropped out of `dark-variant-transparent.png` onto the same
  256px canvas and glyph box as `favicon-transparent.png`, so the two swap
  1:1 at any size. The shipped mark has near-black nodes that disappear on
  dark surfaces. Replace it with a real export when one exists.
- The build-brain scene core (`BrainCore.tsx`) uses `favicon-transparent.png`.
- `index.html` favicon uses `favicon.svg` / `favicon-32.png`.
- `slack.png` is the supplied full-color Slack mark used by `SourceIcon`.

All branding is rendered via `<img>` — the app follows a no-inline-SVG rule
for branding and icons.
