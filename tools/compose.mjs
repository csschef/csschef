// Chrome draws the tilted screens on calmarwebb.se soft (the 3D layer is rasterised at
// low resolution, whatever the device scale). This redraws each screen sharply: the
// marker capture gives every pixel's position on the screen, a homography is fitted
// to it by least squares, and the original screenshot from the site repo is sampled
// through it with 4 x 4 supersampling. Writes .work/<product>-<theme>.png.
import sharp from 'sharp'
import { resolve } from 'node:path'
import { PRODUCTS, SITE, WORK } from './config.mjs'

const SHOTS = resolve(SITE, 'src/assets/produkter')
const FILE = { tablet: 'padda', phone: 'mobil' }
const N = 4 // subsamples per axis

const raw = async (input) => {
  const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  return { data, w: info.width, h: info.height }
}

// Solves A x = b by Gaussian elimination with partial pivoting.
const solve = (A, b) => {
  const n = b.length
  for (let i = 0; i < n; i++) {
    let p = i
    for (let r = i + 1; r < n; r++) if (Math.abs(A[r][i]) > Math.abs(A[p][i])) p = r
    ;[A[i], A[p]] = [A[p], A[i]]
    ;[b[i], b[p]] = [b[p], b[i]]
    for (let r = i + 1; r < n; r++) {
      const f = A[r][i] / A[i][i]
      for (let c = i; c < n; c++) A[r][c] -= f * A[i][c]
      b[r] -= f * b[i]
    }
  }
  const x = new Array(n).fill(0)
  for (let i = n - 1; i >= 0; i--) {
    let s = b[i]
    for (let c = i + 1; c < n; c++) s -= A[i][c] * x[c]
    x[i] = s / A[i][i]
  }
  return x
}

// Fits (X, Y) -> (u, v) from the marker. Only fully covered pixels are used, the
// edges are blended with the frame.
const fit = (mark) => {
  const S = 1000 // keeps the normal equations well conditioned
  const AtA = Array.from({ length: 8 }, () => new Array(8).fill(0))
  const Atb = new Array(8).fill(0)
  const add = (row, rhs) => {
    for (let i = 0; i < 8; i++) {
      Atb[i] += row[i] * rhs
      for (let j = 0; j < 8; j++) AtA[i][j] += row[i] * row[j]
    }
  }
  for (let y = 0; y < mark.h; y += 2) {
    for (let x = 0; x < mark.w; x += 2) {
      const i = (y * mark.w + x) * 4
      if (mark.data[i + 2] < 250 || mark.data[i + 3] < 255) continue
      const u = mark.data[i] / 255, v = mark.data[i + 1] / 255
      const X = x / S, Y = y / S
      add([X, Y, 1, 0, 0, 0, -u * X, -u * Y], u)
      add([0, 0, 0, X, Y, 1, -v * X, -v * Y], v)
    }
  }
  const h = solve(AtA, Atb)
  return (x, y) => {
    const X = x / S, Y = y / S
    const d = h[6] * X + h[7] * Y + 1
    return [(h[0] * X + h[1] * Y + h[2]) / d, (h[3] * X + h[4] * Y + h[5]) / d]
  }
}

const bilinear = (img, fx, fy, out) => {
  const x0 = Math.max(0, Math.min(img.w - 1, Math.floor(fx)))
  const y0 = Math.max(0, Math.min(img.h - 1, Math.floor(fy)))
  const x1 = Math.min(img.w - 1, x0 + 1), y1 = Math.min(img.h - 1, y0 + 1)
  const ax = Math.max(0, Math.min(1, fx - x0)), ay = Math.max(0, Math.min(1, fy - y0))
  for (let c = 0; c < 3; c++) {
    const a = img.data[(y0 * img.w + x0) * 4 + c], b = img.data[(y0 * img.w + x1) * 4 + c]
    const d = img.data[(y1 * img.w + x0) * 4 + c], e = img.data[(y1 * img.w + x1) * 4 + c]
    out[c] += (a * (1 - ax) + b * ax) * (1 - ay) + (d * (1 - ax) + e * ax) * ay
  }
}

for (const p of PRODUCTS) {
  const layers = []
  for (const d of p.devices) {
    const mark = await raw(resolve(WORK, `${p.slug}-mark-${d}.png`))
    const map = fit(mark)
    // Shrink the source to about 1.5 x the screen's widest extent first, so that
    // bilinear sampling with 4 x 4 subsamples does not alias.
    let minX = Infinity, maxX = -Infinity
    for (let y = 0; y < mark.h; y += 4) {
      for (let x = 0; x < mark.w; x += 4) {
        if (mark.data[(y * mark.w + x) * 4 + 2] > 40) {
          minX = Math.min(minX, x)
          maxX = Math.max(maxX, x)
        }
      }
    }
    const path = resolve(SHOTS, `${p.slug}-${FILE[d]}.webp`)
    const { width } = await sharp(path).metadata()
    const src = await raw(await sharp(path).resize({ width: Math.min(width, Math.round((maxX - minX) * 1.5)), kernel: 'lanczos3' }).png().toBuffer())
    layers.push({ mark, map, src })
  }

  for (const theme of ['light', 'dark']) {
    const base = await raw(resolve(WORK, `${p.slug}-base-${theme}.png`))
    const out = Buffer.from(base.data)
    const acc = [0, 0, 0]
    for (const { mark, map, src } of layers) {
      for (let y = 0; y < base.h; y++) {
        for (let x = 0; x < base.w; x++) {
          const i = (y * base.w + x) * 4
          // The marker's blue channel is the coverage: about 14 is the black frame,
          // 255 is the screen.
          const m = Math.max(0, Math.min(1, (mark.data[i + 2] - 14) / (255 - 14))) * (mark.data[i + 3] / 255)
          if (m <= 0) continue
          acc[0] = acc[1] = acc[2] = 0
          for (let sy = 0; sy < N; sy++) {
            for (let sx = 0; sx < N; sx++) {
              const [u, v] = map(x + (sx + 0.5) / N, y + (sy + 0.5) / N)
              bilinear(src, u * src.w - 0.5, v * src.h - 0.5, acc)
            }
          }
          for (let c = 0; c < 3; c++) out[i + c] = Math.round(out[i + c] * (1 - m) + (acc[c] / (N * N)) * m)
        }
      }
    }
    await sharp(out, { raw: { width: base.w, height: base.h, channels: 4 } }).png().toFile(resolve(WORK, `${p.slug}-${theme}.png`))
    console.log(`${p.slug}-${theme}.png`)
  }
}
