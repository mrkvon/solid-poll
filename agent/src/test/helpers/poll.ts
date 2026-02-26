import { LoremIpsum } from 'lorem-ipsum'
import { randomUUID } from 'node:crypto'
import { expect } from 'vitest'
import { User } from './account.js'
import { createAcl } from './acl.js'

export const lipsum = new LoremIpsum()

function createPollTurtle(poll: Poll) {
  return `<${poll.uri}> a <http://rdfs.org/sioc/types#Question>, <http://rdfs.org/sioc/types#Poll>;
    <http://rdfs.org/sioc/ns#content> "${poll.question}";
    ${poll.detail ? `<http://purl.org/dc/terms/description> "${poll.detail?.replace('\n', '\\n')}"; ` : ''}
    <http://purl.org/dc/terms/creator> <${poll.creator}>;
    <http://purl.org/dc/terms/created> "${poll.created.toISOString()}"^^<http://www.w3.org/2001/XMLSchema#dateTime>;
    <http://www.w3.org/ns/ldp#inbox> <${poll.inbox}> .`
}

export interface Poll {
  uri: string
  question: string
  detail?: string
  creator: string
  created: Date
  inbox: string
  answers: Map<string, Answer>
}

export interface Answer {
  uri: string
  answer: string
  creator: User
  votes: Map<string, Vote>
}

export interface Vote {
  uri: string
  creator: User
}

export interface Bot {
  webid: string
  inbox: string
}

export async function createPoll({
  user,
  poll: partialPoll,
  bot,
}: {
  user: User
  poll?: Partial<Poll>
  bot: Bot
}) {
  const poll: Poll = {
    uri: new URL(
      lipsum.generateWords(4).split(/\s+/g).join('/') +
        '#' +
        lipsum.generateWords(1),
      user.account.podUrl,
    ).toString(),
    question: lipsum.generateSentences(1),
    detail: lipsum.generateParagraphs(2),
    created: new Date(),
    creator: user.account.webId,
    inbox: bot.inbox,
    answers: new Map(),
    ...partialPoll,
  }

  await user.fetch(poll.uri, {
    method: 'PUT',
    headers: { 'content-type': 'text/turtle' },
    body: createPollTurtle(poll),
  })

  return poll
}

export async function createPublicPoll({
  user,
  bot,
}: {
  user: User
  bot: Bot
}) {
  const poll = await createPoll({ user, bot })
  await createAcl({
    uri: poll.uri,
    rules: [
      {
        public: true,
        access: ['Read'],
        fragment: '#r',
      },
      {
        agent: user.account.webId,
        access: ['Read', 'Write', 'Append', 'Control'],
        fragment: '#rwac',
      },
      {
        agent: bot.webid,
        access: ['Read', 'Write'],
        fragment: '#rwbot',
      },
    ],
    user,
  })
  return poll
}

export async function createAnswer({
  poll,
  asking,
  answering,
  answer,
}: {
  poll: Poll
  asking: User
  answering: User
  answer?: string
}): Promise<Answer> {
  const answerUri = new URL(poll.uri)
  answerUri.hash = randomUUID()

  answer ??= lipsum.generateSentences(1)

  const response = await asking.fetch(poll.uri, {
    method: 'PATCH',
    headers: { 'content-type': 'text/n3' },
    body: `
    @prefix solid: <http://www.w3.org/ns/solid/terms#> .
    @prefix sioc: <http://rdfs.org/sioc/ns#> .
    @prefix tsioc: <http://rdfs.org/sioc/types#> .
    @prefix dct: <http://purl.org/dc/terms/> .
    @prefix xsd: <http://www.w3.org/2001/XMLSchema#> .

    <#mutation> a solid:InsertDeletePatch;
      solid:inserts {
        <${poll.uri}> sioc:has_reply <${answerUri}> .
        <${answerUri}> a tsioc:Answer ;
          sioc:reply_of <${poll.uri}> ;
          sioc:content "${answer}" ;
          dct:creator <${answering.account.webId}> ;
          dct:created "${new Date().toISOString()}"^^xsd:dateTme .
      } .
    `,
  })

  expect(response.ok).toBe(true)

  return {
    uri: answerUri.toString(),
    creator: answering,
    answer,
    votes: new Map(),
  }
}

export async function createVote({
  asking,
  voting,
  answer,
}: {
  asking: User
  voting: User
  answer: Answer
}): Promise<Vote> {
  const voteUri = new URL(answer.uri)
  voteUri.hash = randomUUID()

  const response = await asking.fetch(voteUri, {
    method: 'PATCH',
    headers: { 'content-type': 'text/n3' },
    body: `
    @prefix solid: <http://www.w3.org/ns/solid/terms#> .
    @prefix sioc: <http://rdfs.org/sioc/ns#> .
    @prefix tsioc: <http://rdfs.org/sioc/types#> .
    @prefix dct: <http://purl.org/dc/terms/> .
    @prefix xsd: <http://www.w3.org/2001/XMLSchema#> .
    @prefix spoll: <https://spoll.example/> .
    @prefix schema: <https://schema.org/> .

    <#mutation> a solid:InsertDeletePatch;
      solid:inserts {
        <${answer.uri}> spoll:has_vote <${voteUri}> .
        <${voteUri}> a schema:VoteAction ;
          schema:object <${answer.uri}> ;
          dct:creator <${voting.account.webId}> ;
          dct:created "${new Date().toISOString()}"^^xsd:dateTme .
      } .
    `,
  })

  expect(response.ok).toBe(true)

  return { uri: voteUri.toString(), creator: voting }
}

export const bot: Bot = {
  webid: 'http://localhost:3000/card#bot',
  inbox: 'http://localhost:3000/inbox/',
}
