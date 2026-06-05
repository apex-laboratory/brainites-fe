# Brand assets

Drop the shared **Brainite** logo here as `brainite-logo.png` (or `.webp`).

- Path is referenced by `LOGO_ASSET_PATH` in `src/constants/brand.ts`.
- Once present, update `src/components/shared/AppLogo.tsx` to render it via an
  `<img>` and remove the temporary text lockup (see the TODO there).
- If the logo arrives as SVG, export it to PNG/WebP first — the app follows a
  no-inline-SVG rule for branding and icons.
