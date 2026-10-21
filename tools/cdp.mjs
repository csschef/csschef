// Drives headless Chrome over the DevTools protocol, without dependencies (Node has
// WebSocket built in). runJobs takes a list of jobs and runs them in one browser:
//   url          navigate first (without it the job continues on the same page)
//   width, height, scale, mobile   the viewport
//   dark, reduced                  prefers-color-scheme and prefers-reduced-motion
//   transparent  no default page background, so screenshots keep alpha
//   css          a <style> to inject (unlayered, so it beats the site's @layer rules)
//   scrollThrough  scroll the page once so lazy images load
//   selector     screenshot one element; it is scrolled into view and given `settle`
//                ms first, because calmarwebb.se starts its animations on scroll
//   clip         {x, y, w, h} in document pixels
//   full         the whole page
//   eval         an expression whose value is returned
//   out          where to save the PNG
import { spawn } from 'node:child_process'
import { mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { CHROME, WORK } from './config.mjs'

const PORT = 9341
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

export async function runJobs(jobs) {
  const profile = resolve(WORK, 'chrome-profile')
  mkdirSync(profile, { recursive: true })
  const proc = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`, '--hide-scrollbars', '--allow-file-access-from-files', 'about:blank'], { stdio: 'ignore' })
  const results = []
  try {
    let target
    for (let i = 0; i < 50 && !target; i++) {
      await sleep(200)
      try {
        const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json()
        target = list.find((t) => t.type === 'page')
      } catch {
        // Not up yet.
      }
    }
    if (!target) throw new Error('Chrome did not start')
    const ws = new WebSocket(target.webSocketDebuggerUrl)
    await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej })
    let id = 0
    const pending = new Map()
    ws.onmessage = (ev) => {
      const msg = JSON.parse(ev.data)
      if (msg.id && pending.has(msg.id)) {
        const { resolve: ok, reject } = pending.get(msg.id)
        pending.delete(msg.id)
        msg.error ? reject(new Error(msg.error.message)) : ok(msg.result)
      }
    }
    const send = (method, params = {}) => new Promise((ok, reject) => {
      const n = ++id
      pending.set(n, { resolve: ok, reject })
      ws.send(JSON.stringify({ id: n, method, params }))
    })
    const ev = async (expression) => {
      const r = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })
      if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description ?? 'evaluation failed')
      return r.result.value
    }
    await send('Page.enable')
    await send('Runtime.enable')

    for (const j of jobs) {
      const w = j.width ?? 1440, h = j.height ?? 900
      await send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: j.scale ?? 2, mobile: !!j.mobile })
      await send('Emulation.setEmulatedMedia', { features: [
        { name: 'prefers-color-scheme', value: j.dark ? 'dark' : 'light' },
        { name: 'prefers-reduced-motion', value: j.reduced ? 'reduce' : 'no-preference' },
      ] })
      if (j.url) {
        await send('Page.navigate', { url: j.url })
        await sleep(1500)
      }
      if (j.transparent) await send('Emulation.setDefaultBackgroundColorOverride', { color: { r: 0, g: 0, b: 0, a: 0 } })
      if (j.css) await ev(`(() => { const s = document.createElement('style'); s.textContent = ${JSON.stringify(j.css)}; document.head.append(s); return true; })()`)
      if (j.scrollThrough) {
        const H = await ev('document.documentElement.scrollHeight')
        for (let y = 0; y < H; y += h / 2) {
          await ev(`scrollTo(0, ${y})`)
          await sleep(120)
        }
        await ev('scrollTo(0, 0)')
        await sleep(800)
      }
      if (j.eval) results.push(await ev(j.eval))
      await sleep(j.wait ?? 400)
      if (!j.out) continue

      const params = { format: 'png' }
      if (j.full) {
        // Always 1x: a full page at 2x (about 1850 x 6800 px) hung Chrome for minutes.
        const H = await ev('document.documentElement.scrollHeight')
        params.captureBeyondViewport = true
        params.clip = { x: 0, y: 0, width: w, height: H, scale: 1 }
      }
      if (j.clip) {
        params.captureBeyondViewport = true
        params.clip = { x: j.clip.x ?? 0, y: j.clip.y, width: j.clip.w ?? w, height: j.clip.h, scale: 1 }
      }
      if (j.selector) {
        await ev(`document.querySelector(${JSON.stringify(j.selector)}).scrollIntoView({ block: 'center' })`)
        await sleep(j.settle ?? 2500)
        const b = await ev(`(() => { const r = document.querySelector(${JSON.stringify(j.selector)}).getBoundingClientRect(); return { x: r.x + scrollX, y: r.y + scrollY, w: r.width, h: r.height }; })()`)
        params.clip = { x: b.x, y: b.y, width: b.w, height: b.h, scale: 1 }
      }
      const r = await send('Page.captureScreenshot', params)
      writeFileSync(j.out, Buffer.from(r.data, 'base64'))
    }
    ws.close()
  } finally {
    proc.kill()
  }
  return results
}
