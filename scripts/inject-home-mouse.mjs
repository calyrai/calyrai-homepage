import { readFile, writeFile } from 'node:fs/promises'

const file = process.argv[2]
if (!file) throw new Error('Usage: node scripts/inject-home-mouse.mjs <html-file>')

const marker = '<script src="/calyr-mouse.js" defer></script>'
const html = await readFile(file, 'utf8')
if (!html.includes(marker)) {
  if (!html.includes('</body>')) throw new Error(`Missing </body> in ${file}`)
  await writeFile(file, html.replace('</body>', `  ${marker}\n</body>`))
}
