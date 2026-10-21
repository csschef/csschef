// Renders ../README.md the way GitHub does and screenshots it, so a change can be
// checked before it is pushed. GitHub's markdown API gives the sanitised HTML
// (<picture> ends up in <themed-picture>), github-markdown-css gives the styles.
// Writes .work/preview.html and .work/preview-{desktop-light,desktop-dark,phone}.png.
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { runJobs } from './cdp.mjs'
import { REPO, WORK } from './config.mjs'

mkdirSync(WORK, { recursive: true })

const CSS = 'https://cdn.jsdelivr.net/npm/github-markdown-css@5.8.1'
for (const theme of ['light', 'dark']) {
  const file = resolve(WORK, `github-markdown-${theme}.css`)
  if (!existsSync(file)) writeFileSync(file, await (await fetch(`${CSS}/github-markdown-${theme}.css`)).text())
}

const res = await fetch('https://api.github.com/markdown', {
  method: 'POST',
  headers: { Accept: 'application/vnd.github+json', 'User-Agent': 'csschef-readme-preview' },
  body: JSON.stringify({ text: readFileSync(resolve(REPO, 'README.md'), 'utf8'), mode: 'gfm', context: 'csschef/csschef' }),
})
if (!res.ok) throw new Error(`GitHub answered ${res.status}: ${await res.text()}`)

// The README box on a profile page: 1 px border, 24 px padding, GitHub's page colours.
const css = (theme) => pathToFileURL(resolve(WORK, `github-markdown-${theme}.css`)).href
const html = resolve(WORK, 'preview.html')
writeFileSync(html, `<!doctype html><html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<base href="${pathToFileURL(REPO).href}/">
<link rel="stylesheet" href="${css('light')}" media="(prefers-color-scheme: light)">
<link rel="stylesheet" href="${css('dark')}" media="(prefers-color-scheme: dark)">
<style>
  html { background: #fff; }
  @media (prefers-color-scheme: dark) { html { background: #0d1117; } .box { border-color: #3d444d !important; } }
  body { margin: 0; padding: 16px; }
  .box { border: 1px solid #d1d9e0; border-radius: 6px; padding: 24px; box-sizing: border-box; margin: 0 auto; }
  .markdown-body { background: transparent !important; }
</style></head><body>
<div class="box" id="box"><article class="markdown-body">${await res.text()}</article></div>
<script>const w = new URLSearchParams(location.search).get('w'); if (w) document.getElementById('box').style.width = w + 'px';</script>
</body></html>`)

// 896 px is the README box on a desktop profile page.
const url = (q) => `${pathToFileURL(html).href}?${q}`
await runJobs([
  { url: url('w=896&n=1'), width: 928, scale: 1, full: true, wait: 1500, out: resolve(WORK, 'preview-desktop-light.png') },
  { url: url('w=896&n=2'), width: 928, scale: 1, full: true, wait: 1500, dark: true, out: resolve(WORK, 'preview-desktop-dark.png') },
  { url: url('n=3'), width: 390, height: 844, mobile: true, scale: 1, full: true, wait: 1500, out: resolve(WORK, 'preview-phone.png') },
])
console.log(`Preview in ${WORK}`)
