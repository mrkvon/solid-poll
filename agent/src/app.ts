import { bodyParser } from '@koa/bodyparser'
import cors from '@koa/cors'
import Router from '@koa/router'
import { solidIdentity } from '@soid/koa'
import Koa from 'koa'
import { saveToPoll } from './middlewares/inbox.js'
import { loadConfig } from './middlewares/loadConfig.js'
import { serveWebid } from './middlewares/webid.js'

export interface AppConfig {
  readonly webId: string
  readonly isBehindProxy?: boolean
}

export const createApp = (config: AppConfig) => {
  const app = new Koa()
  app.proxy = Boolean(config.isBehindProxy)

  const router = new Router()
    // overwrite default webid because we want to include inbox
    .get(new URL(config.webId).pathname, serveWebid)
    .get('/', async ctx => {
      ctx.body = 'Hello World'
    })
    .post('/inbox', saveToPoll)
    .use(solidIdentity(config.webId).routes())

  app
    .use(cors())
    .use(
      bodyParser({
        extendTypes: {
          json: ['application/ld+json'],
        },
      }),
    )
    .use(loadConfig(config))
    .use(router.routes())
    .use(router.allowedMethods())

  return app
}
