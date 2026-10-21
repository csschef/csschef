// Builds the images in ../assets in the calmarwebb.se "Nordisk triptyk" style.
//   node build.mjs [--out <dir>]
// SVGs: the header, the section labels and the platform rows, with the fonts subset
// to the glyphs each file uses and pinned to one weight. WebPs: the product images,
// from compose.mjs's output in .work/ (skipped if it is not there).
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import sharp from 'sharp'
import subsetFont from 'subset-font'
import { ASSETS, SITE, WORK } from './config.mjs'

const outArg = process.argv.indexOf('--out')
const OUT = outArg > -1 ? resolve(process.argv[outArg + 1]) : ASSETS
mkdirSync(OUT, { recursive: true })

const FONTS = resolve(SITE, 'public/fonts')
const fontBuf = {
  mona: readFileSync(resolve(FONTS, 'mona-sans.woff2')),
  mono: readFileSync(resolve(FONTS, 'jetbrains-mono.woff2')),
}
const family = { mona: 'Mona Sans', mono: 'JetBrains Mono' }

// The site's tokens, converted from oklch.
const THEMES = {
  light: {
    ink: '#131922', soft: '#49505b', faint: '#656b74', accent: '#195fbf',
    line: 'rgb(19 25 34 / 0.12)', strong: 'rgb(19 25 34 / 0.28)',
    grid: 'rgb(25 95 191 / 0.09)', major: 'rgb(25 95 191 / 0.18)',
  },
  dark: {
    ink: '#eceff2', soft: '#afb5bc', faint: '#8a9098', accent: '#82b4f6',
    line: 'rgb(236 239 242 / 0.13)', strong: 'rgb(236 239 242 / 0.3)',
    grid: 'rgb(130 180 246 / 0.08)', major: 'rgb(130 180 246 / 0.15)',
  },
}

const face = async (key, weight, text) => {
  const chars = [...new Set(text)].join('')
  const buf = await subsetFont(fontBuf[key], chars, { targetFormat: 'woff2', variationAxes: { wght: weight } })
  return `@font-face { font-family: '${family[key]}'; font-weight: ${weight}; src: url(data:font/woff2;base64,${buf.toString('base64')}) format('woff2'); }`
}

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;')

// The plus sign: 15 px with 1.5 px strokes, like the section markers on the site.
const plus = (x, y, cls = 'p') => `<path class="${cls}" d="M${x - 7.5} ${y}h15M${x} ${y - 7.5}v15"/>`

// ---------------------------------------------------------------- Header

// Text only, on a transparent background so it sits on GitHub's own colours. The
// blueprint grid and the plus signs carry the style, as behind the hero text on
// the site.
const HERO_H = 300 // the hairline is at 291, the plus signs reach below it
const LINE_Y = 291
const NAME = 'SEBASTIAN VALDEMARSSON'
const PLACE = 'KALMAR'
const COORDS = '56.66° N, 16.36° E'
// Two lines where there is room, three on phones. Widths measured with measure.mjs
// (em): "Building stuff I actually" 10.42, "Building stuff" 6.08.
const LINES_2 = ['Building stuff I actually', 'want to use']
const LINES_3 = ['Building stuff', 'I actually', 'want to use']

const headline = (x, ys, lines) =>
  `<text class="h1">${lines.map((l, i) => `<tspan x="${x}" y="${ys[i]}">${esc(l)}${i === lines.length - 1 ? '<tspan class="dot">.</tspan>' : ''}</tspan>`).join('')}</text>`

// The coordinates join the eyebrow where it fits. On phones the place is its own
// element, so it can be hidden when the line does not fit (it was cut on a 360 px
// phone). Mono at 11 px advances 7.92 px per character.
const eyebrow = (x, y, sq, coords) => {
  const start = x + sq + 12
  const box = `<rect class="sq" x="${x}" y="${y - sq}" width="${sq}" height="${sq}"/>`
  if (coords) {
    return box + `<text class="eye" x="${start}" y="${y}"><tspan class="name">${NAME}</tspan><tspan dx="16">${PLACE}</tspan><tspan dx="16">${COORDS}</tspan></text>`
  }
  const placeX = +(start + NAME.length * 7.92 + 16).toFixed(1)
  return box + `<text class="eye" x="${start}" y="${y}"><tspan class="name">${NAME}</tspan></text><text class="eye place" x="${placeX}" y="${y}">${PLACE}</text>`
}
const PLACE_END = Math.ceil(24 + 7 + 12 + NAME.length * 7.92 + 16 + PLACE.length * 7.92)

async function header(t) {
  const c = THEMES[t]
  const fonts = [
    await face('mona', 700, LINES_2.join('') + '.'),
    await face('mono', 500, PLACE + COORDS),
    await face('mono', 600, NAME),
  ].join('\n    ')

  // The grid: thin lines every 48 px, stronger every 192, from the content's left
  // edge, faded out towards the right.
  const grid = (id, x0) => `
    <pattern id="minor-${id}" width="48" height="48" x="${x0}" y="24" patternUnits="userSpaceOnUse">
      <rect width="1" height="48" fill="${c.grid}"/><rect width="48" height="1" fill="${c.grid}"/>
    </pattern>
    <pattern id="major-${id}" width="192" height="192" x="${x0}" y="24" patternUnits="userSpaceOnUse">
      <rect width="1" height="192" fill="${c.major}"/><rect width="192" height="1" fill="${c.major}"/>
    </pattern>`
  const gridRects = (id) =>
    `<g mask="url(#grid-mask)"><rect width="100%" height="${LINE_Y}" fill="url(#minor-${id})"/><rect width="100%" height="${LINE_Y}" fill="url(#major-${id})"/></g>`

  // Stars at grid crossings that no text covers. Only shown with a mouse.
  const stars = [[424, 24, -2], [616, 216, -7], [808, 24, -11]]
    .map(([x, y, d]) => `<path class="p s" style="animation-delay:${d}s" d="M${x} ${y - 8.5}v17M${x - 8.5} ${y}h17"/>`).join('')

  // The hairline gets a plus sign where it crosses the content's edges.
  const edge = (x) => `${plus(x, LINE_Y + 0.5)}<svg x="100%" overflow="visible">${plus(-x, LINE_Y + 0.5)}</svg>`

  return `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="${HERO_H}" role="img" aria-label="Sebastian Valdemarsson, Kalmar. Building stuff I actually want to use.">
  <style>
    ${fonts}
    .eye { font: 500 11.5px 'JetBrains Mono', ui-monospace, monospace; letter-spacing: 0.12em; fill: ${c.faint}; }
    .name { font-weight: 600; fill: ${c.accent}; }
    .sq { fill: ${c.accent}; }
    .h1 { font: 700 60px 'Mona Sans', system-ui, sans-serif; letter-spacing: -0.035em; fill: ${c.ink}; }
    .dot { fill: ${c.accent}; }
    .p { fill: none; stroke: ${c.accent}; stroke-width: 1.5; }
    .s { opacity: 0; transform-box: fill-box; transform-origin: center; }
    /* Twinkle only with a mouse. On phones the constant repaints made the
       GitHub app's scrollbar flicker. */
    @media (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference) {
      .s { animation: twinkle 13s ease-in-out infinite; }
    }
    @keyframes twinkle {
      0%, 30%, 100% { opacity: 0; transform: scale(0.7); }
      14% { opacity: 1; transform: scale(1); }
    }
    /* Three layouts by the image's own width: the headline on two lines at 60 and
       48 px, and on phones three lines without the coordinates and the stars. */
    .m, .n { display: none; }
    @media (max-width: 719.98px) {
      .w { display: none; }
      .m { display: inline; }
      .h1 { font-size: 48px; }
    }
    @media (max-width: 579.98px) {
      .m, .stars { display: none; }
      .n { display: inline; }
      .h1 { font-size: 36px; }
      .eye { font-size: 11px; }
    }
    @media (max-width: ${PLACE_END + 4}px) {
      .place { display: none; }
    }
    /* "Building stuff" is 6.08 em: at 36 px it needs 24 + 219 px. Narrower than
       that, as on a 320 px phone, the headline was cut. */
    @media (max-width: 249.98px) {
      .h1 { font-size: 32px; }
    }
  </style>
  <defs>
    ${grid('w', 40)}
    ${grid('n', 24)}
    <linearGradient id="fade">
      <stop offset="0" stop-color="#fff"/>
      <stop offset="0.4" stop-color="#fff" stop-opacity="0.5"/>
      <stop offset="0.85" stop-color="#fff" stop-opacity="0"/>
    </linearGradient>
    <mask id="grid-mask"><rect width="100%" height="100%" fill="url(#fade)"/></mask>
  </defs>

  <g class="w">
    ${gridRects('w')}
    ${eyebrow(40, 72, 8, true)}
    ${headline(40, [156, 217], LINES_2)}
    ${edge(40)}
  </g>

  <g class="m">
    ${gridRects('w')}
    ${eyebrow(40, 82, 8, true)}
    ${headline(40, [153, 202], LINES_2)}
    ${edge(40)}
  </g>

  <g class="n">
    ${gridRects('n')}
    ${eyebrow(24, 78, 7, false)}
    ${headline(24, [134, 171, 208], LINES_3)}
    ${edge(24)}
  </g>

  <g class="stars">${stars}</g>
  <rect y="${LINE_Y}" width="100%" height="1" fill="${c.line}"/>
</svg>
`
}

// ---------------------------------------------------------------- Section labels

// The number in Mona Sans 300 in the text colour, a blue stroke on the hairline
// under it, the label in mono beside it and a short line on the right (the site's
// section label). The numbers' widths are measured with measure.mjs (em at 44 px).
const NUM_SIZE = 44
const NUM_EM = { '01': 0.957, '02': 1.155, '03': 1.1838 }
const HEADS = [
  { slug: 'about', num: '01', label: 'ABOUT', aside: 'KALMAR, SWEDEN' },
  { slug: 'featured', num: '02', label: 'FEATURED', aside: 'APPS / GAMES' },
  { slug: 'more', num: '03', label: 'MORE PROJECTS', aside: 'TEAM / SCHOOL / HOBBY' },
]

async function head(h, t) {
  const c = THEMES[t]
  const w = +(NUM_EM[h.num] * NUM_SIZE).toFixed(1)
  const fonts = [await face('mona', 300, h.num), await face('mono', 500, h.label + h.aside)].join('\n    ')
  return `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="104" role="img" aria-label="${h.num} ${h.label}">
  <style>
    ${fonts}
    .num { font: 300 ${NUM_SIZE}px 'Mona Sans', system-ui, sans-serif; fill: ${c.ink}; }
    .label { font: 500 12.8px 'JetBrains Mono', ui-monospace, monospace; letter-spacing: 0.12em; fill: ${c.ink}; }
    .aside { fill: ${c.faint}; }
    /* The line on the right does not fit beside the label on phones. */
    @media (max-width: 419.98px) { .aside { display: none; } }
  </style>
  <text class="num" x="0" y="70">${h.num}</text>
  <text class="label" x="${+(w + 17.6).toFixed(1)}" y="70">${h.label}</text>
  <svg x="100%" overflow="visible"><text class="label aside" x="0" y="70" text-anchor="end">${esc(h.aside)}</text></svg>
  <rect y="86" width="100%" height="1" fill="${c.strong}"/>
  <!-- The stroke sits on the hairline, as wide as the number. -->
  <rect y="86" width="${w}" height="2" fill="${c.accent}"/>
</svg>
`
}

// ---------------------------------------------------------------- Platform rows

// The kind of product as plain text and the platforms in boxes, as in the product
// rows on the site. Only list what is out (check the stores); `soon` is a dashed box.
// Mono has a fixed advance: 0.6 em per character plus 0.12 em letter spacing.
const META_SIZE = 11.2
const ADV = META_SIZE * 0.72
const META = [
  { slug: 'moniko', isNew: true, kind: 'APP', tags: [{ name: 'WEB' }], label: 'New. App, on the web.' },
  { slug: 'cawa', kind: 'APP', tags: [{ name: 'GOOGLE PLAY' }, { name: 'WEB' }, { name: 'APP STORE SOON', soon: true }], label: 'App, on Google Play and the web. App Store soon.' },
  { slug: 'dorkus', kind: 'GAME', tags: [{ name: 'GOOGLE PLAY' }, { name: 'WEB' }], label: 'Game, on Google Play and the web.' },
]

async function meta(m, t) {
  const c = THEMES[t]
  const top = 3.5, boxH = 22.7, base = top + 15.5
  const parts = []
  let x = 0
  if (m.isNew) {
    parts.push(`<rect class="sq" x="0" y="${base - 8}" width="8" height="8"/>`)
    x = 8 + 9
    parts.push(`<text class="new" x="${x}" y="${base}">NEW</text>`)
    x += 3 * ADV + 17.6
  }
  parts.push(`<text class="kind" x="${+x.toFixed(2)}" y="${base}">${m.kind}</text>`)
  x += m.kind.length * ADV + 17.6
  for (const tag of m.tags) {
    const w = tag.name.length * ADV + 2 * 7.28 + 2
    parts.push(`<rect class="box${tag.soon ? ' soon' : ''}" x="${+(x + 0.5).toFixed(2)}" y="${top + 0.5}" width="${+(w - 1).toFixed(2)}" height="${boxH - 1}"/>`)
    parts.push(`<text class="tag${tag.soon ? ' soon' : ''}" x="${+(x + 1 + 7.28).toFixed(2)}" y="${base}">${tag.name}</text>`)
    x += w + 6.4
  }
  // The row shrinks in steps when the image is narrower than the row (Cawa's did not
  // fit on a phone). Media queries in an SVG measure the image's own width.
  const total = Math.ceil(x - 6.4)
  const steps = [0.92, 0.84, 0.76]
  const shrink = steps
    .map((s, i) => `@media (max-width: ${Math.floor(total * (i ? steps[i - 1] : 1))}px) { .row { transform: scale(${s}); } }`)
    .join('\n    ')
  const fonts = [await face('mono', 500, m.kind + m.tags.map((tag) => tag.name).join(''))]
  if (m.isNew) fonts.push(await face('mono', 600, 'NEW'))
  return `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="30" role="img" aria-label="${m.label}">
  <style>
    ${fonts.join('\n    ')}
    text { font: 500 ${META_SIZE}px 'JetBrains Mono', ui-monospace, monospace; letter-spacing: 0.12em; }
    .kind { fill: ${c.faint}; }
    .tag { fill: ${c.soft}; }
    .box { fill: none; stroke: ${c.strong}; stroke-width: 1; }
    /* Coming soon: a dashed box and fainter text, no colour. */
    .box.soon { stroke-dasharray: 3 2; }
    .tag.soon { fill: ${c.faint}; }
    .sq { fill: ${c.accent}; }
    .new { font-weight: 600; fill: ${c.accent}; }
    .row { transform-origin: 0 15px; }
    ${shrink}
  </style>
  <g class="row">
  ${parts.join('\n  ')}
  </g>
</svg>
`
}

for (const t of ['light', 'dark']) {
  writeFileSync(resolve(OUT, `header-${t}.svg`), await header(t))
  for (const h of HEADS) writeFileSync(resolve(OUT, `head-${h.slug}-${t}.svg`), await head(h, t))
  for (const m of META) writeFileSync(resolve(OUT, `meta-${m.slug}-${t}.svg`), await meta(m, t))
}
console.log(`SVGs written to ${OUT}`)

// ---------------------------------------------------------------- Product images

// Cawa's and Dorkus's images are the same in both themes (their backdrops cover the
// whole image), Moniko's blueprint backdrop follows the theme.
const WEBP = [
  ['moniko-light.png', 'moniko-light.webp'],
  ['moniko-dark.png', 'moniko-dark.webp'],
  ['cawa-light.png', 'cawa-row.webp'],
  ['dorkus-light.png', 'dorkus-row.webp'],
]
if (WEBP.every(([src]) => existsSync(resolve(WORK, src)))) {
  for (const [src, dst] of WEBP) {
    await sharp(resolve(WORK, src)).webp({ quality: 82, alphaQuality: 100, effort: 6 }).toFile(resolve(OUT, dst))
  }
  console.log(`Product images written to ${OUT}`)
} else {
  console.log('No composed product images in .work/, skipped the WebPs (run capture and compose first)')
}
