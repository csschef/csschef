// Paths and settings shared by the scripts. Override with environment variables.
import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'

export const TOOLS = fileURLToPath(new URL('.', import.meta.url))
export const REPO = resolve(TOOLS, '..')
export const ASSETS = resolve(REPO, 'assets')
// Captures and other intermediate files. Ignored by git.
export const WORK = resolve(TOOLS, '.work')

// The calmarwebb.se repo (fonts, product screenshots), next to this one by default,
// and the built site served by `npx astro preview` in that repo.
export const SITE = process.env.SITE_DIR ?? resolve(REPO, '../calmarwebb.se')
export const SITE_URL = process.env.SITE_URL ?? 'http://localhost:4321'

export const CHROME = process.env.CHROME ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe'

// The product rows in the order they appear on calmarwebb.se (row = nth-child of
// .rows) and the devices in each row's image.
export const PRODUCTS = [
  { slug: 'cawa', row: 1, devices: ['tablet', 'phone'] },
  { slug: 'dorkus', row: 2, devices: ['phone'] },
  { slug: 'moniko', row: 3, devices: ['tablet', 'phone'] },
]
