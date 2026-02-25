import glob from 'fast-glob'
import fs from 'node:fs/promises'
import path from 'node:path'

const files = await glob('./src/**/*.shacl', { dot: true })
await Promise.all(
  files.map(async src => {
    const dest = path.join('dist', path.relative('src', src))
    await fs.mkdir(path.dirname(dest), { recursive: true })
    await fs.copyFile(src, dest)
  }),
)
