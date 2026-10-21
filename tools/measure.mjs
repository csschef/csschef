// Measures text widths in the real fonts, in em, for the constants in build.mjs.
//   node measure.mjs                      the headline lines and section numbers
//   node measure.mjs "Some other line"    any text in the headline style
// Measured from the rendered DOM: canvas measureText reported a fallback font.
import { writeFileSync, mkdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { runJobs } from './cdp.mjs'
import { SITE, WORK } from './config.mjs'

mkdirSync(WORK, { recursive: true })
const font = (file) => pathToFileURL(resolve(SITE, 'public/fonts', file)).href
const headline = process.argv.length > 2 ? process.argv.slice(2) : ['Building stuff I actually', 'want to use.', 'Building stuff', 'I actually']
const numbers = ['01', '02', '03']

const html = resolve(WORK, 'measure.html')
writeFileSync(html, `<!doctype html><meta charset="utf-8">
<style>
  @font-face { font-family: 'Mona Sans'; font-weight: 200 900; src: url('${font('mona-sans.woff2')}') format('woff2'); }
  span { position: absolute; white-space: pre; }
</style>
<script>
  window.measure = async (headline, numbers) => {
    await document.fonts.load("700 100px 'Mona Sans'");
    await document.fonts.load("300 100px 'Mona Sans'");
    const m = (text, font, spacing) => {
      const e = document.createElement('span');
      e.textContent = text;
      e.style.font = font;
      e.style.letterSpacing = spacing;
      document.body.append(e);
      const w = e.getBoundingClientRect().width;
      e.remove();
      return +(w / 100).toFixed(4);
    };
    const out = {};
    for (const s of headline) out[s] = m(s, "700 100px 'Mona Sans'", '-0.035em');
    for (const s of numbers) out['number ' + s] = m(s, "300 100px 'Mona Sans'", '0');
    return out;
  };
</script>`)

const [widths] = await runJobs([{ url: pathToFileURL(html).href, width: 1400, height: 600, scale: 1, eval: `window.measure(${JSON.stringify(headline)}, ${JSON.stringify(numbers)})` }])
for (const [text, em] of Object.entries(widths)) console.log(`${em.toFixed(4)} em  ${text}`)
