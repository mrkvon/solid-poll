import { createLdoDataset, getDataset, set } from '@ldo/ldo'
import { SignalWatcher } from '@lit-labs/signals'
import type { ContextDefinition } from 'jsonld'
import { css, html, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import {
  CreateVoteActivityShapeType,
  PollShapeType,
  RemoveVoteActivityShapeType,
} from './ldo/app.shapeTypes.js'
import type {
  Answer,
  CreateVoteActivity,
  RemoveVoteActivity,
  Vote,
} from './ldo/app.typings.js'
import './spoll-answer-form.js'
import { dataset } from './state/dataset.js'
import { session, webId } from './state/session.js'

@customElement('spoll-answer')
export class SpollAnswer extends SignalWatcher(LitElement) {
  @property({ attribute: false }) answer!: Answer
  @property() uri!: string
  @property({ type: Boolean }) disabled?: boolean

  private async reloadResource(uri: string) {
    // reload poll
    const presult = await dataset.getResource(uri).read()
    if (presult.isError) throw presult
  }

  async handleVote(answer: Answer) {
    this.disabled = true
    try {
      const ldods = createLdoDataset()
      const vote = ldods
        .usingType(CreateVoteActivityShapeType)
        .fromSubject('#activity')
      Object.assign(vote, {
        type: set({ '@id': 'Create' }),
        actor: { '@id': webId.get()! },
        object: {
          type: set({ '@id': 'VoteAction' }),
          object: { '@id': answer['@id'] } as Answer,
        } as Vote,
      } satisfies CreateVoteActivity)
      const jsonld = await import('jsonld')

      const jld = await jsonld.fromRDF(getDataset(vote))

      const frame = {
        '@context': [
          'https://www.w3.org/ns/activitystreams',
          {
            tsioc: 'http://rdfs.org/sioc/types#',
            sioc: 'http://rdfs.org/sioc/ns#',
            schema: 'https://schema.org/',
          },
        ],
        '@type': 'Create', // or Update, etc.
      }

      const framed = await jsonld.frame(jld, frame, {
        embed: '@always',
        explicit: false,
        requireAll: false,
      })

      const compacted = await jsonld.compact(framed, [
        'https://www.w3.org/ns/activitystreams',
        {
          tsioc: 'http://rdfs.org/sioc/types#',
          sioc: 'http://rdfs.org/sioc/ns#',
          schema: 'https://schema.org/',
        },
      ] as unknown as ContextDefinition)

      const poll = dataset.usingType(PollShapeType).fromSubject(this.uri)
      if (!poll?.inbox?.['@id']) throw new Error('Inbox not found!')

      const inboxResponse = await session.authFetch(poll.inbox['@id'], {
        method: 'POST',
        headers: { 'content-type': 'application/ld+json' },
        body: JSON.stringify(compacted),
      })

      if (!inboxResponse.ok) throw new Error('Writing to inbox not successful')

      // reload poll
      await this.reloadResource(this.uri)
    } finally {
      this.disabled = false
    }
  }

  async handleRemoveVote(vote: Vote) {
    this.disabled = true
    try {
      const ldods = createLdoDataset()
      const removeVoteActivity = ldods
        .usingType(RemoveVoteActivityShapeType)
        .fromSubject('#activity')
      Object.assign(removeVoteActivity, {
        type: set({ '@id': 'Remove' }),
        actor: { '@id': webId.get()! },
        object: {
          '@id': vote['@id'],
          type: set({ '@id': 'VoteAction' }),
          object: { '@id': vote.object['@id'] },
        } as Vote,
      } satisfies RemoveVoteActivity)
      const jsonld = await import('jsonld')

      const jld = await jsonld.fromRDF(getDataset(removeVoteActivity))

      const frame = {
        '@context': [
          'https://www.w3.org/ns/activitystreams',
          {
            tsioc: 'http://rdfs.org/sioc/types#',
            sioc: 'http://rdfs.org/sioc/ns#',
            schema: 'https://schema.org/',
          },
        ],
        '@type': 'Remove', // or Update, etc.
      }

      const framed = await jsonld.frame(jld, frame, {
        embed: '@always',
        explicit: false,
        requireAll: false,
      })

      const compacted = await jsonld.compact(framed, [
        'https://www.w3.org/ns/activitystreams',
        {
          tsioc: 'http://rdfs.org/sioc/types#',
          sioc: 'http://rdfs.org/sioc/ns#',
          schema: 'https://schema.org/',
        },
      ] as unknown as ContextDefinition)

      const poll = dataset.usingType(PollShapeType).fromSubject(this.uri)
      if (!poll?.inbox?.['@id']) throw new Error('Inbox not found!')

      const inboxResponse = await session.authFetch(poll.inbox['@id'], {
        method: 'POST',
        headers: { 'content-type': 'application/ld+json' },
        body: JSON.stringify(compacted),
      })

      if (!inboxResponse.ok) throw new Error('Writing to inbox not successful')

      const presult = await dataset.getResource(this.uri).read()
      if (presult.isError) throw presult
    } finally {
      this.disabled = false
    }
  }

  render() {
    const voteCount = this.answer.hasVote?.size ?? 0
    const ownVotes = this.answer.hasVote?.filter(
      v => v.creator['@id'] === webId.get(),
    )
    const voted = ownVotes?.size ?? 0 > 0
    return html`
      <wa-button
        ?disabled=${this.disabled}
        @click=${() =>
          voted
            ? this.handleRemoveVote(ownVotes!.values().next().value)
            : this.handleVote(this.answer)}
        size="small"
        appearance=${voted ? 'filled-outlined' : 'outlined'}
        variant=${voted ? 'success' : 'neutral'}
      >
        <wa-icon name="arrow-up" label="vote" part="icon"></wa-icon>
        <span data-testid="poll-answer-votes">${voteCount}</span>
      </wa-button>
      ${this.answer.content}
    `
  }

  static styles = css``
}

declare global {
  interface HTMLElementTagNameMap {
    'spoll-answer': SpollAnswer
  }
}
