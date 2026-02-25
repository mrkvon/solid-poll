import type { SolidLeaf } from '@ldo/connected-solid'
import { createLdoDataset, getDataset, set } from '@ldo/ldo'
import { SignalWatcher } from '@lit-labs/signals'
import type { ContextDefinition } from 'jsonld'
import { css, html, LitElement, type PropertyValues } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { repeat } from 'lit/directives/repeat.js'
import { PollShapeType, VoteActivityShapeType } from './ldo/app.shapeTypes'
import type { Answer, Vote, VoteActivity } from './ldo/app.typings.js'
import './spoll-answer-form.js'
import { dataset } from './state/dataset'
import { isLoggedIn, session, webId } from './state/session'

@customElement('spoll-poll')
export class SpollPoll extends SignalWatcher(LitElement) {
  @property() uri!: string

  @state() resource: SolidLeaf = dataset.getResource(this.uri) as SolidLeaf
  // @state() poll?: Poll

  private onPollUpdate = () => {
    this.requestUpdate()
  }

  protected async willUpdate(changed: PropertyValues) {
    if (changed.has('uri') && this.uri) {
      this.resource.off('update', this.onPollUpdate)
      this.resource = dataset.getResource(this.uri) as SolidLeaf
      this.resource.on('update', this.onPollUpdate)
      const result = await this.resource.read()
      if (result.isError) throw result
    }
  }

  disconnectedCallback(): void {
    this.resource.off('update', this.onPollUpdate)
    super.disconnectedCallback()
  }

  async handleVote(answer: Answer) {
    const ldods = createLdoDataset()
    const vote = ldods.usingType(VoteActivityShapeType).fromSubject('#activity')
    Object.assign(vote, {
      type: set({ '@id': 'Create' }),
      actor: { '@id': webId.get()! },
      object: {
        type: set({ '@id': 'VoteAction' }),
        object: { '@id': answer['@id'] } as Answer,
      } as Vote,
    } satisfies VoteActivity)
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

    const presult = await this.resource.read()
    if (presult.isError) throw presult
  }

  render() {
    const poll = dataset.usingType(PollShapeType).fromSubject(this.uri)
    return html`
      <dl>
        <dt>uri</dt>
        <dd>${poll?.['@id']}</dd>

        <dt>question</dt>
        <dd data-testid="poll-question">${poll?.content}</dd>

        <dt>created</dt>
        <dd>${poll?.created}</dd>

        <dt>creator</dt>
        <dd>${poll?.creator?.['@id']}</dd>

        <dt>detail</dt>
        <dd data-testid="poll-detail">${poll?.description}</dd>

        <dt>answers</dt>
        ${repeat(
          poll?.hasReply ?? [],
          answer => answer['@id'],
          answer => {
            const voteCount = answer.hasVote?.size ?? 0
            return html`<dd data-testid="poll-answer">
              ${answer.content}
              <wa-button @click=${() => this.handleVote(answer)}>
                <wa-icon name="arrow-up" label="vote" part="icon"></wa-icon>
                <span data-testid="poll-answer-votes">${voteCount}</span>
              </wa-button>
            </dd>`
          },
        )}
      </dl>
      ${isLoggedIn.get() && poll
        ? html`<spoll-answer-form .poll=${poll}></spoll-answer-form>`
        : undefined}
    `
  }

  static styles = css`
    dd {
      word-wrap: break-word;
    }
  `
}

declare global {
  interface HTMLElementTagNameMap {
    'spoll-poll': SpollPoll
  }
}

declare module '@ldo/connected-solid' {
  interface SolidLeaf {
    on(event: 'update', callback: () => void): void
    off(event: 'update', callback: () => void): void
  }
}
