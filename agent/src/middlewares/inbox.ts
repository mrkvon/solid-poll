import { getAuthenticatedFetch } from '@soid/koa'
import { Middleware } from 'koa'
import { DataFactory, Literal, NamedNode, Store, Writer } from 'n3'
import { randomUUID } from 'node:crypto'
import { rdf, sioc } from 'rdf-namespaces'
import { AppConfig } from '../app.js'
import { HttpError } from '../utils/errors.js'

const { namedNode, quad } = DataFactory

export const saveToPoll: Middleware<{
  config: AppConfig
  data: Store
}> = async ctx => {
  const authFetch = await getAuthenticatedFetch(ctx.state.config.webId)

  const uuid = randomUUID()

  const store = ctx.state.data

  const poll = store.getObjects(
    null,
    'http://rdfs.org/sioc/ns#reply_of',
    null,
  )[0] as NamedNode
  const content = store.getObjects(
    null,
    namedNode(sioc.content),
    null,
  )[0] as Literal

  const nuuid = namedNode(`#${uuid}`)

  const writer = new Writer()

  writer.addQuads([
    quad(poll, namedNode(sioc.has_reply), nuuid),
    quad(
      nuuid,
      namedNode(rdf.type),
      namedNode('http://rdfs.org/sioc/types#Answer'),
    ),
    quad(nuuid, namedNode(sioc.content), content),
    quad(nuuid, namedNode(sioc.reply_of), poll),
  ])

  const turtle = await new Promise((resolve, reject) =>
    writer.end((error, result) => {
      if (error) reject(error)
      else resolve(result)
    }),
  )

  const response = await authFetch(poll.value, {
    method: 'PATCH',
    headers: { 'content-type': 'text/n3' },
    body: `@prefix solid: <http://www.w3.org/ns/solid/terms#>.
      @prefix sioc: <http://rdfs.org/sioc/ns#>.
      @prefix tsioc: <http://rdfs.org/sioc/types#>.

      <#mutation> a solid:InsertDeletePatch;
        solid:inserts {
          ${turtle}
        }.
      `,
  })

  if (!response.ok) throw new HttpError('HTTP Error Response', response)

  ctx.body = await response.text()
  ctx.status = 200
}
