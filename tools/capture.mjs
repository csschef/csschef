// Captures the product rows from calmarwebb.se into .work/:
//   <product>-base-<theme>.png   the row image as the site draws it, transparent
//                                outside its clip shape, in each theme
//   <product>-mark-<device>.png  the same image with that device's screen painted
//                                with R = x and G = y, for compose.mjs
// Needs the built site running: `npm run build && npx astro preview` in the
// calmarwebb.se repo (set SITE_URL if it is not on port 4321).
import { mkdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { runJobs } from './cdp.mjs'
import { PRODUCTS, SITE_URL, WORK } from './config.mjs'

mkdirSync(WORK, { recursive: true })

// The page as a transparent backdrop: no paper, no row panel, no header over the image.
const BASE_CSS = `html, body, .section, .row { background: transparent; }
  .row { border-color: transparent; }
  .site-header { visibility: hidden; }
  .section::before { display: none; }`

const page = (n) => ({ url: `${SITE_URL}/?capture=${n}`, width: 1440, height: 900, scale: 2, reduced: true, transparent: true })
let n = 0
const jobs = []
for (const p of PRODUCTS) {
  const media = `.row:nth-child(${p.row}) .row-media`
  for (const theme of ['light', 'dark']) {
    jobs.push({ ...page(n++), dark: theme === 'dark', css: BASE_CSS })
    jobs.push({ out: resolve(WORK, `${p.slug}-base-${theme}.png`), selector: media, dark: theme === 'dark' })
  }
  // Everything black except the one screen. The gradients are blended with `screen`
  // over blue, so each pixel reads (x, y, 255) in 0-255 across the screen.
  for (const d of p.devices) {
    const row = `.row:nth-child(${p.row})`
    const css = `${BASE_CSS}
      ${row} .row-media img { visibility: hidden; }
      ${row} .mock { background: #000; }
      ${row} .screen { background: #000; }
      ${row} .device-${d} .screen {
        background-color: #00f;
        background-image: linear-gradient(to right, #000, #f00), linear-gradient(to bottom, #000, #0f0);
        background-blend-mode: screen, screen;
      }`
    jobs.push({ ...page(n++), css })
    jobs.push({ out: resolve(WORK, `${p.slug}-mark-${d}.png`), selector: media })
  }
}

await runJobs(jobs)
console.log(`Captured ${jobs.filter((j) => j.out).length} images into ${WORK}`)
