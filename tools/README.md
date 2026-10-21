# README images

The images in [`../assets`](../assets) are generated from [calmarwebb.se](https://calmarwebb.se), so the profile follows the site's design. Don't edit them by hand.

Needs Node 22+, Chrome, and the calmarwebb.se repo next to this one (or set `SITE_DIR`).

```bash
npm install
```

## Text and SVGs

The header, the section labels and the platform rows are built from the constants in `build.mjs`:

```bash
npm run build
```

When a headline line or a section number changes, measure it in the real font first and update the widths in `build.mjs`:

```bash
npm run measure -- "A new headline line"
```

## Product images

The product images are captured from the built site. Start it in the calmarwebb.se repo with `npm run build && npx astro preview`, and set `SITE_URL` if it doesn't run on port 4321. Then:

```bash
npm run capture   # row images and screen markers into .work/
npm run compose   # redraws the tilted screens sharply
npm run build     # SVGs and WebPs into ../assets
```

Chrome draws the tilted screens soft, so `compose` redraws them from the original screenshots in the site repo.

## Check before pushing

```bash
npm run preview
```

Renders `../README.md` through GitHub's markdown API and saves screenshots (desktop light and dark, phone) in `.work/`.
