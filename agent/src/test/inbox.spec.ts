import { describe, expect, it } from 'vitest'
import { createRandomUser } from './helpers/account.js'
import { createPublicPoll } from './helpers/poll.js'
import { TestContext } from './setup.js'

describe('POSTing to inbox', () => {
  describe('create answer', () => {
    it.only<TestContext>('should post activity to inbox and save answer to Solid pod', async ctx => {
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
        body: JSON.stringify({
          '@context': [
            'https://www.w3.org/ns/activitystreams',
            {
              tsioc: 'http://rdfs.org/sioc/types#',
              sioc: 'http://rdfs.org/sioc/ns#',
            },
          ],
          id: '#activity',
          type: 'Create',
          actor: answering.account.webId,
          object: {
            type: 'tsioc:Answer',
            'sioc:content':
              'This is the answer to the Ultimate question of Life, Universe and Everything.',
            'sioc:reply_of': {
              id: poll.uri,
            },
          },
        }),
      })
      expect(response.status).toBe(200)
    })
  })

  describe('update answer', () => {})
  describe('delete answer', () => {})
  describe('create vote', () => {})
  describe('update vote', () => {})
  describe('delete vote', () => {})
})
