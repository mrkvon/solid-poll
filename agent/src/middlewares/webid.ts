import { Middleware } from 'koa'
import { AppConfig } from '../app.js'

export const serveWebid: Middleware<{ config: AppConfig }> = async ctx => {
  ctx.body = `
    @prefix foaf: <http://xmlns.com/foaf/0.1/> .
    @prefix solid: <http://www.w3.org/ns/solid/terms#> .
    @prefix ldp: <http://www.w3.org/ns/ldp#> .

    <${new URL(ctx.state.config.webId).hash}> a foaf:Agent;
      solid:oidcIssuer <${new URL(ctx.state.config.webId).origin}>;
      ldp:inbox </inbox/>.
  `
  ctx.headers['content-type'] = 'text/turtle'
  ctx.status = 200
}
