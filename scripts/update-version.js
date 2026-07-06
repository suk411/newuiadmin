import { readFileSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const versionPath = resolve(__dirname, '..', 'public', 'version.json')

const raw = readFileSync(versionPath, 'utf-8')
const data = JSON.parse(raw)

const parts = data.version.split('.').map(Number)
parts[2] = (parts[2] || 0) + 1
data.version = parts.join('.')

writeFileSync(versionPath, JSON.stringify(data, null, 2) + '\n')
console.log(`version.json → ${data.version}`)
