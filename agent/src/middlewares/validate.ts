import jsonld, { JsonLdDocument } from 'jsonld'
import { Middleware } from 'koa'
import { Parser, Quad, Store } from 'n3'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import SHACLValidator from 'rdf-validate-shacl'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Folder containing your SHACL files
const shapesDir = path.join(__dirname, 'shapes')

// Read all files in the folder
const files = await fs.readdir(shapesDir)

// Filter for files ending with .shacl
const shaclFiles = files.filter(file => file.endsWith('.shacl'))

const parser = new Parser()
const shaclRdf: Quad[] = []

for (const file of shaclFiles) {
  const filePath = path.join(shapesDir, file)
  const shaclContent = await fs.readFile(filePath, 'utf8')

  // Parse SHACL to RDF quads
  const quads = parser.parse(shaclContent)
  shaclRdf.push(...quads)
}

// const __filename = fileURLToPath(import.meta.url)
// const __dirname = path.dirname(__filename)
// const filePath = path.join(__dirname, 'shapes', 'create-answer.shacl')
// const shacl = await fs.readFile(filePath, 'utf8')

// const parser = new Parser()

// const shaclRdf = parser.parse(shacl)

export const validateActivity: Middleware<{ data: Store }> = async (
  ctx,
  next,
) => {
  const doc = ctx.request.body
  const quads = await jsonld.toRDF(doc as JsonLdDocument, {
    base: 'https://example',
  })
  if (!Array.isArray(quads)) throw new Error('unexpected string output')
  const data = new Store(quads)
  const validator = new SHACLValidator(new Store(shaclRdf))
  const report = await validator.validate(data)

  if (report.conforms) {
    ctx.state.data = data
    await next()
  } else {
    const body = report.results.map(result => ({
      node: result.focusNode?.value,
      path: result.path?.value,
      value: result.value?.value,
      message: result.message.map(msg => msg.value),
    }))

    ctx.body = body
    ctx.status = 400
  }
}
