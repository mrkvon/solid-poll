import { Middleware } from 'koa'
import { DataFactory, Store } from 'n3'

const { namedNode } = DataFactory

export const verifyActor: Middleware<{ user: string; data: Store }> = async (
  ctx,
  next,
) => {
  const authenticatedUser = ctx.state.user
  const actor = ctx.state.data.getObjects(
    null,
    namedNode('https://www.w3.org/ns/activitystreams#actor'),
    null,
  )

  if (actor.length !== 1)
    throw new Error(`Exactly one actor expected. Found ${actor.length}.`)

  if (authenticatedUser && actor[0] && authenticatedUser === actor[0].value) {
    await next()
  } else {
    ctx.status = 403
    ctx.body = {
      error: 'Forbidden',
      message: 'Actor does not match authenticated user.',
      actor: actor[0].value,
      user: authenticatedUser,
    }
  }
}
