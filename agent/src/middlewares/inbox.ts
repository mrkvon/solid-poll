import { getAuthenticatedFetch } from '@soid/koa'
import jsonld, { JsonLdDocument } from 'jsonld'
import { Middleware } from 'koa'
import { DataFactory } from 'n3'
import { randomUUID } from 'node:crypto'
import { AppConfig } from '../app.js'
import { HttpError } from '../utils/errors.js'

const { namedNode, literal } = DataFactory

export const saveToPoll: Middleware<{ config: AppConfig }> = async ctx => {
  const doc = ctx.request.body as JsonLdDocument

  const frame = {
    '@context': [
      'https://www.w3.org/ns/activitystreams',
      {
        tsioc: 'http://rdfs.org/sioc/types#',
        sioc: 'http://rdfs.org/sioc/ns#',
      },
    ],
    '@type': 'Create',
    actor: {},
    object: {
      '@type': 'tsioc:Answer',
      'sioc:content': {},
      'sioc:reply_of': {
        '@embed': '@always',
      },
    },
  }

  // TODO fix this!
  const framed = (await jsonld.frame(doc, frame)) as {
    '@context': [string, { tsioc: string; sioc: string }]
    id: string
    type: 'Create'
    actor: string
    object: {
      type: 'tsioc:Answer'
      'sioc:content': string
      'sioc:reply_of': {
        id: string
      }
    }
  }

  const authFetch = await getAuthenticatedFetch(ctx.state.config.webId)

  const uuid = randomUUID()

  const response = await authFetch(framed.object['sioc:reply_of'].id, {
    method: 'PATCH',
    headers: { 'content-type': 'text/n3' },
    body: `@prefix solid: <http://www.w3.org/ns/solid/terms#>.
      @prefix sioc: <http://rdfs.org/sioc/ns#>.
      @prefix tsioc: <http://rdfs.org/sioc/types#>.

      <#mutation> a solid:InsertDeletePatch;
        solid:inserts {
          <${namedNode(framed.object['sioc:reply_of'].id).value}> sioc:has_reply <#${uuid}>.
          <#${uuid}> a tsioc:Answer;
            sioc:content "${literal(framed.object['sioc:content']).value}"
        }.
      `,
  })

  if (!response.ok) throw new HttpError('HTTP Error Response', response)

  ctx.body = await response.text()
  ctx.status = 200
}
