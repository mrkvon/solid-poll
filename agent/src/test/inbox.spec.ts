import { describe, expect, it } from 'vitest'
import { createRandomUser, User } from './helpers/account.js'
import {
  Answer,
  createAnswer,
  createPublicPoll,
  createVote,
  lipsum,
  Poll,
  Vote,
} from './helpers/poll.js'
import { TestContext } from './setup.js'

function generateActivity(
  options:
    | {
        type: 'Create Answer'
        user: User
        poll: Poll
        answer?: string
      }
    | { type: 'Create Vote'; user: User; answer: Answer }
    | { type: 'Remove Vote'; user: User; answer: Answer; vote: Vote },
) {
  switch (options.type) {
    case 'Create Answer': {
      const answer = options.answer ?? lipsum.generateSentences(1)
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
        actor: options.user.account.webId,
        object: {
          type: 'tsioc:Answer',
          'sioc:content': answer,
          'sioc:reply_of': {
            id: options.poll.uri,
          },
        },
      }
    }
    case 'Create Vote': {
      return {
        '@context': [
          'https://www.w3.org/ns/activitystreams',
          {
            tsioc: 'http://rdfs.org/sioc/types#',
            sioc: 'http://rdfs.org/sioc/ns#',
            schema: 'https://schema.org/',
          },
        ],
        id: '#activity',
        type: 'Create',
        actor: options.user.account.webId,
        object: {
          type: 'schema:VoteAction',
          'schema:object': {
            id: options.answer.uri,
          },
        },
      }
    }
    case 'Remove Vote': {
      return {
        '@context': [
          'https://www.w3.org/ns/activitystreams',
          {
            tsioc: 'http://rdfs.org/sioc/types#',
            sioc: 'http://rdfs.org/sioc/ns#',
            schema: 'https://schema.org/',
          },
        ],
        id: '#activity',
        type: 'Remove',
        actor: options.user.account.webId,
        object: {
          id: options.vote.uri,
          type: 'schema:VoteAction',
          'schema:object': {
            id: options.answer.uri,
          },
        },
      }
    }
    default: {
      throw new Error('not matched')
    }
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

      // intentionally damage the request
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
    it<TestContext>('can create a vote', async ctx => {
      const asking = await createRandomUser({ oidcIssuer: ctx.css.origin })
      const answering = await createRandomUser({ oidcIssuer: ctx.css.origin })
      const voting = await createRandomUser({ oidcIssuer: ctx.css.origin })

      const poll = await createPublicPoll({
        user: asking,
        bot: {
          webid: ctx.app.webId,
          inbox: new URL('/inbox', ctx.app.origin).toString(),
        },
      })

      const answers = [
        await createAnswer({ poll, asking, answering }),
        await createAnswer({ poll, asking, answering }),
      ]

      answers.forEach(a => poll.answers.set(a.uri, a))

      const response = await voting.fetch(`${ctx.app.origin}/inbox`, {
        method: 'POST',
        headers: { 'content-type': 'application/ld+json' },
        body: JSON.stringify(
          generateActivity({
            type: 'Create Vote',
            user: voting,
            answer: answers[1],
          }),
        ),
      })
      expect(response.status).toBe(200)
    })

    it.todo('can not create a second vote by the same person')
  })
  describe('update vote', () => {
    it.todo('TODO')
  })
  describe('remove vote', () => {
    it<TestContext>('can remove own vote', async ctx => {
      const asking = await createRandomUser({ oidcIssuer: ctx.css.origin })
      const answering = await createRandomUser({ oidcIssuer: ctx.css.origin })
      const voting = await createRandomUser({ oidcIssuer: ctx.css.origin })

      const poll = await createPublicPoll({
        user: asking,
        bot: {
          webid: ctx.app.webId,
          inbox: new URL('/inbox', ctx.app.origin).toString(),
        },
      })

      const answers = [
        await createAnswer({ poll, asking, answering }),
        await createAnswer({ poll, asking, answering }),
      ]
      answers.forEach(a => poll.answers.set(a.uri, a))

      const vote = await createVote({ asking, voting, answer: answers[0] })

      answers[0].votes.set(vote.uri, vote)

      const response = await voting.fetch(`${ctx.app.origin}/inbox`, {
        method: 'POST',
        headers: { 'content-type': 'application/ld+json' },
        body: JSON.stringify(
          generateActivity({
            type: 'Remove Vote',
            user: voting,
            answer: answers[1],
            vote,
          }),
        ),
      })
      expect(response.status).toBe(200)
    })

    it.todo('can not remove a vote of someone else')
  })
})
