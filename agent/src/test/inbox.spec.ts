import { describe, expect, it } from 'vitest'
import { createRandomUser, User } from './helpers/account.js'
import { createPublicPoll, lipsum, Poll } from './helpers/poll.js'
import { TestContext } from './setup.js'

function generateActivity({
  type,
  user,
  poll,
  answer,
}: {
  type: 'Create Answer'
  user: User
  poll: Poll
  answer?: string
}) {
  if (type === 'Create Answer') answer ??= lipsum.generateSentences(1)
  return {
    '@context': [
      'https://www.w3.org/ns/activitystreams',
      {
        tsioc: 'http://rdfs.org/sioc/types#',
        sioc: 'http://rdfs.org/sioc/ns#',
      },
    ],
    id: '#activity',
    type: 'Create',
    actor: user.account.webId,
    object: {
      type: 'tsioc:Answer',
      'sioc:content': answer,
      'sioc:reply_of': {
        id: poll.uri,
      },
    },
  }
}

describe('POSTing to inbox', () => {
  it<TestContext>('should reject unauthenticated requests with 401', async ctx => {
    const asking = await createRandomUser({ oidcIssuer: ctx.css.origin })
    const answering = await createRandomUser({ oidcIssuer: ctx.css.origin })

    const poll = await createPublicPoll({
      user: asking,
      bot: {
        webid: ctx.app.webId,
        inbox: new URL('/inbox', ctx.app.origin).toString(),
      },
    })

    const response = await fetch(`${ctx.app.origin}/inbox`, {
      method: 'POST',
      headers: { 'content-type': 'application/ld+json' },
      body: JSON.stringify(
        generateActivity({ type: 'Create Answer', user: answering, poll }),
      ),
    })
    expect(response.status).toBe(401)
  })

  describe('create answer', () => {
    it<TestContext>('should post activity to inbox and save answer to Solid pod', async ctx => {
      const asking = await createRandomUser({ oidcIssuer: ctx.css.origin })
      const answering = await createRandomUser({ oidcIssuer: ctx.css.origin })

      const poll = await createPublicPoll({
        user: asking,
        bot: {
          webid: ctx.app.webId,
          inbox: new URL('/inbox', ctx.app.origin).toString(),
        },
      })

      const response = await answering.fetch(`${ctx.app.origin}/inbox`, {
        method: 'POST',
        headers: { 'content-type': 'application/ld+json' },
        body: JSON.stringify(
          generateActivity({ type: 'Create Answer', user: answering, poll }),
        ),
      })
      expect(response.status).toBe(200)
    })

    it<TestContext>('[invalid body] should fail with validation error', async ctx => {
      const asking = await createRandomUser({ oidcIssuer: ctx.css.origin })
      const answering = await createRandomUser({ oidcIssuer: ctx.css.origin })

      const poll = await createPublicPoll({
        user: asking,
        bot: {
          webid: ctx.app.webId,
          inbox: new URL('/inbox', ctx.app.origin).toString(),
        },
      })

      const invalidActivity = generateActivity({
        type: 'Create Answer',
        user: answering,
        poll,
      })

      // @ts-expect-error We want to intentionally build invalid object.
      delete invalidActivity.object['sioc:reply_of']

      const response = await answering.fetch(`${ctx.app.origin}/inbox`, {
        method: 'POST',
        headers: { 'content-type': 'application/ld+json' },
        body: JSON.stringify(invalidActivity),
      })

      expect(response.status).toBe(400)
    })

    it<TestContext>('[empty answer] should fail with validation error', async ctx => {
      const asking = await createRandomUser({ oidcIssuer: ctx.css.origin })
      const answering = await createRandomUser({ oidcIssuer: ctx.css.origin })

      const poll = await createPublicPoll({
        user: asking,
        bot: {
          webid: ctx.app.webId,
          inbox: new URL('/inbox', ctx.app.origin).toString(),
        },
      })

      const invalidActivity = generateActivity({
        type: 'Create Answer',
        user: answering,
        poll,
      })

      invalidActivity.object['sioc:content'] = '    '

      const response = await answering.fetch(`${ctx.app.origin}/inbox`, {
        method: 'POST',
        headers: { 'content-type': 'application/ld+json' },
        body: JSON.stringify(invalidActivity),
      })

      expect(response.status).toBe(400)
    })

    it<TestContext>('[author does not match authenticated user] should fail with Not Authorized error', async ctx => {
      const asking = await createRandomUser({ oidcIssuer: ctx.css.origin })
      const sender = await createRandomUser({ oidcIssuer: ctx.css.origin })
      const actor = await createRandomUser({ oidcIssuer: ctx.css.origin })

      const poll = await createPublicPoll({
        user: asking,
        bot: {
          webid: ctx.app.webId,
          inbox: new URL('/inbox', ctx.app.origin).toString(),
        },
      })

      const activity = generateActivity({
        type: 'Create Answer',
        user: actor,
        poll,
      })

      const response = await sender.fetch(`${ctx.app.origin}/inbox`, {
        method: 'POST',
        headers: { 'content-type': 'application/ld+json' },
        body: JSON.stringify(activity),
      })

      expect(response.status).toBe(403)
    })
  })

  describe('update answer', () => {
    it.todo('TODO')
  })
  describe('delete answer', () => {
    it.todo('TODO')
  })
  describe('create vote', () => {
    it.todo('TODO')
  })
  describe('update vote', () => {
    it.todo('TODO')
  })
  describe('delete vote', () => {
    it.todo('TODO')
  })
})
