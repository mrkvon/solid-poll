import { bodyParser } from '@koa/bodyparser'
import cors from '@koa/cors'
import Router from '@koa/router'
import { solidIdentity } from '@soid/koa'
import Koa from 'koa'
import { Store } from 'n3'
import { verifyActor } from './middlewares/authz.js'
import { saveToPoll } from './middlewares/inbox.js'
import { loadConfig } from './middlewares/loadConfig.js'
import { solidAuth } from './middlewares/solidAuthn.js'
import { validateActivity } from './middlewares/validate.js'
import { serveWebid } from './middlewares/webid.js'

export interface AppConfig {
  readonly webId: string
  readonly isBehindProxy?: boolean
}

export const createApp = (config: AppConfig) => {
  const app = new Koa()
  app.proxy = Boolean(config.isBehindProxy)

  const router = new Router<{
    config: AppConfig
    user: string
    data: Store
  }>()
    // overwrite default webid because we want to include inbox
    .get(new URL(config.webId).pathname, serveWebid)
    .get('/', async ctx => {
      ctx.body = 'Hello World'
    })
    .post('/inbox', solidAuth, validateActivity, verifyActor, saveToPoll)
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
