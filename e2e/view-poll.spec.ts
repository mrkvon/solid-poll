import { expect, test } from '@playwright/test'
import { LoremIpsum } from 'lorem-ipsum'
import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import parse from 'parse-link-header'
import { acl, foaf } from 'rdf-namespaces'
import { createRandomUser, User } from './helpers/account'

test.describe('View a poll', () => {
  let user: User
  let poll: Poll
  test.beforeEach(async (/*{ page }*/) => {
    user = await createRandomUser()
    // await signin(page, user)
  })

  // create poll
  test.beforeEach(async () => {
    poll = await createPoll({ user })
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
      ],
      user,
    })
  })

  test('see question, author, date, link, detail', async ({ page }) => {
    await page.goto(`/polls/${encodeURIComponent(poll.uri)}`)

    await expect(page.getByTestId('poll-question')).toHaveText(poll.question)
    await expect(page.getByTestId('poll-detail')).toHaveText(poll.detail!)
  })
  test.fixme('see answers', () => {})
  test.fixme('see votes with details', () => {})
  test.fixme('sort answers by highest votes', () => {})
  test.fixme('sort answers by creation time (oldest or newest)', () => {})
})

const lipsum = new LoremIpsum()

function createPollTurtle(poll: Poll) {
  return `<${poll.uri}> a <http://rdfs.org/sioc/types#Question>, <http://rdfs.org/sioc/types#Poll>;
    <http://rdfs.org/sioc/ns#content> "${poll.question}";
    ${poll.detail ? `<http://purl.org/dc/terms/description> "${poll.detail?.replace('\n', '\\n')}"; ` : ''}
    <http://purl.org/dc/terms/creator> <${poll.creator}>;
    <http://purl.org/dc/terms/created> "${poll.created.toISOString()}"^^<http://www.w3.org/2001/XMLSchema#dateTime>.`
}

interface Poll {
  uri: string
  question: string
  detail?: string
  creator: string
  created: Date
}

async function createPoll({
  user,
  poll: partialPoll,
}: {
  user: User
  poll?: Partial<Poll>
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
    ...partialPoll,
  }

  await user.fetch(poll.uri, {
    method: 'PUT',
    headers: { 'content-type': 'text/turtle' },
    body: createPollTurtle(poll),
  })

  return poll
}

interface AclRule {
  access: ('Read' | 'Write' | 'Append' | 'Control')[]
  agent?: string
  agentClass?: boolean
  agentGroup?: boolean
  public?: boolean
  fragment?: `#${string}`
}

async function createAcl({
  uri,
  rules,
  user,
}: {
  uri: string
  rules: AclRule[]
  user: User
}) {
  const resp = await fetch(uri)
  const resource = resp.url

  const parsed = parse(resp.headers.get('link'))

  const aclurl = parsed?.['acl']?.url

  assert(aclurl)

  let aclttl = ''

  for (const rule of rules) {
    const fragment = rule.fragment ?? `#${randomUUID()}`

    aclttl += `<${fragment}> a <${acl.Access}> ;`
    aclttl += `\n<${acl.accessTo}> <${resource}> ;`
    if (rule.public) aclttl += `\n<${acl.agentClass}> <${foaf.Agent}> ;`
    if (rule.agent) aclttl += `\n<${acl.agent}> <${rule.agent}> ;`
    aclttl += `\n<${acl.mode}> ${rule.access.map(a => `<${acl[a]}>`)} .`
  }

  console.log(resource, resp.headers, aclttl)

  await user.fetch(aclurl, {
    method: 'PUT',
    body: aclttl,
    headers: { 'content-type': 'text/turtle' },
  })
}
