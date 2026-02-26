import { getAuthenticatedFetch } from '@soid/koa'
import { Middleware } from 'koa'
import {
  DataFactory,
  Literal,
  NamedNode,
  Parser,
  Quad,
  Quad_Subject,
  Store,
  Writer,
} from 'n3'
import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { as, dct, rdf, schema_https, sioc, xsd } from 'rdf-namespaces'
import { AppConfig } from '../app.js'
import { HttpError } from '../utils/errors.js'

const { namedNode, quad, literal } = DataFactory

export const processActivity: Middleware<{
  config: AppConfig
  data: Store
  user: string
}> = async ctx => {
  const authFetch = await getAuthenticatedFetch(ctx.state.config.webId)
  const store = ctx.state.data

  let activityType: NamedNode | undefined = undefined

  const allowedActivities = [
    namedNode(as.Create),
    namedNode(as.Update),
    namedNode(as.Remove),
  ]

  const activitySubjects: Quad_Subject[] = []
  for (const activity of allowedActivities) {
    const subjects = store.getSubjects(namedNode(rdf.type), activity, null)
    if (subjects.length === 1) activityType = activity
    if (subjects.length > 0) activitySubjects.push(...subjects)
  }

  assert.equal(activitySubjects.length, 1)
  assert(activityType)

  const objects = store.getObjects(activitySubjects[0], as.object, null)
  assert.equal(objects.length, 1)
  const objectTypes = store.getObjects(objects[0], rdf.type, null)
  assert.equal(objectTypes.length, 1)

  let inserts: Quad[]
  let targetResource: string
  // let deletes: Quad[] = []

  switch (activityType.value + objectTypes[0].value) {
    case `${as.Create}http://rdfs.org/sioc/types#Answer`: {
      const uuid = randomUUID()
      const nuuid = namedNode(`#${uuid}`)

      const poll = store.getObjects(
        null,
        'http://rdfs.org/sioc/ns#reply_of',
        null,
      )[0] as NamedNode
      const content = store.getObjects(
        null,
        namedNode(sioc.content),
        null,
      )[0] as Literal

      inserts = [
        quad(poll, namedNode(sioc.has_reply), nuuid),
        quad(
          nuuid,
          namedNode(rdf.type),
          namedNode('http://rdfs.org/sioc/types#Answer'),
        ),
        quad(nuuid, namedNode(sioc.content), content),
        quad(nuuid, namedNode(sioc.reply_of), poll),
      ]
      targetResource = poll.value

      break
    }
    case `${as.Create}${schema_https.VoteAction}`: {
      const voteNode = namedNode(`#${randomUUID()}`)

      const answer = store.getObjects(
        objects[0],
        namedNode(schema_https.object),
        null,
      )[0]
      assert(answer)
      assert(answer instanceof NamedNode)
      const description = store.getObjects(
        objects[0],
        namedNode(schema_https.description),
        null,
      )[0]

      inserts = [
        quad(answer, namedNode('https://spoll.example/has_vote'), voteNode),
        quad(voteNode, namedNode(rdf.type), namedNode(schema_https.VoteAction)),
        quad(voteNode, namedNode(schema_https.object), answer),
        quad(
          voteNode,
          namedNode(dct.created),
          literal(new Date().toISOString(), namedNode(xsd.dateTime)),
        ),
        quad(voteNode, namedNode(dct.creator), namedNode(ctx.state.user)),
      ]
      if (description) {
        assert(description instanceof Literal)
        inserts.push(
          quad(voteNode, namedNode(schema_https.description), description),
        )
      }

      targetResource = answer.value
      break
    }
    case `${as.Remove}${schema_https.VoteAction}`: {
      // TODO check
      const vote = objects[0]

      assert(vote)
      assert(vote instanceof NamedNode)

      const dataResponse = await authFetch(vote.value, {
        method: 'GET',
        headers: { accept: 'text/turtle' },
      })

      assert(dataResponse.ok)

      const data = await dataResponse.text()
      const etag = dataResponse.headers.get('etag')

      const parser = new Parser({ baseIRI: dataResponse.url })
      const store = new Store(parser.parse(data))
      const triplesToRemove = store.getQuads(vote, null, null, null)
      triplesToRemove.push(...store.getQuads(null, null, vote, null))

      const writer = new Writer({ format: 'text/n3' })

      writer.addQuads(triplesToRemove)

      const n3 = await new Promise((resolve, reject) =>
        writer.end((error, result) => {
          if (error) reject(error)
          else resolve(result)
        }),
      )

      const response = await authFetch(vote.value, {
        method: 'PATCH',
        headers: { 'content-type': 'text/n3', 'if-match': etag! },
        body: `@prefix solid: <http://www.w3.org/ns/solid/terms#>.
      @prefix sioc: <http://rdfs.org/sioc/ns#>.
      @prefix tsioc: <http://rdfs.org/sioc/types#>.

      <#mutation> a solid:InsertDeletePatch;
        solid:deletes {
          ${n3}
        }.
      `,
      })

      if (!response.ok) throw new HttpError('HTTP Error Response', response)

      ctx.body = await response.text()
      ctx.status = 200
      return
    }
    default: {
      throw new Error('Activity not processed')
    }
  }

  const writer = new Writer()

  writer.addQuads(inserts)

  const turtle = await new Promise((resolve, reject) =>
    writer.end((error, result) => {
      if (error) reject(error)
      else resolve(result)
    }),
  )

  const response = await authFetch(targetResource, {
    method: 'PATCH',
    headers: { 'content-type': 'text/n3' },
    body: `@prefix solid: <http://www.w3.org/ns/solid/terms#>.
      @prefix sioc: <http://rdfs.org/sioc/ns#>.
      @prefix tsioc: <http://rdfs.org/sioc/types#>.

      <#mutation> a solid:InsertDeletePatch;
        solid:inserts {
          ${turtle}
        }.
      `,
  })

  if (!response.ok) throw new HttpError('HTTP Error Response', response)

  ctx.body = await response.text()
  ctx.status = 200
}
