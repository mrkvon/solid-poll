import { bodyParser } from '@koa/bodyparser'
import cors from '@koa/cors'
import Router from '@koa/router'
import { getAuthenticatedFetch, solidIdentity } from '@soid/koa'
import jsonld, { JsonLdDocument } from 'jsonld'
import Koa from 'koa'
import { DataFactory } from 'n3'
import { randomUUID } from 'node:crypto'

const { namedNode, literal } = DataFactory

const app = new Koa()
const router = new Router()
router.use(
  solidIdentity(
    'http://localhost:3000/card#bot',
    'http://localhost:3000',
  ).routes(),
)
router
  .get('/card', async ctx => {
    ctx.body = `<#bot> a <http://xmlns.com/foaf/0.1/Agent>;
    <http://www.w3.org/ns/solid/terms#oidcIssuer> <http://localhost:3000>
  `
    ctx.headers['content-type'] = 'text/turtle'
  })
  .get('/', async ctx => {
    ctx.body = 'Hello World'
  })
  .post('/inbox', async ctx => {
    console.log('**************************************')
    console.log(ctx.request.body)

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

    console.log(framed, 'framed')

    const authFetch = await getAuthenticatedFetch(
      'http://localhost:3000/card#bot',
      'http://localhost:3000',
    )

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

    ctx.body = await response.text()
    ctx.status = response.status
  })

app
  .use(cors())
  .use(
    bodyParser({
      extendTypes: {
        json: ['application/ld+json'],
      },
    }),
  )
  .use(router.routes())
  .use(router.allowedMethods())

app.listen(3000, () => {
  console.log('listening on port 3000')
})
