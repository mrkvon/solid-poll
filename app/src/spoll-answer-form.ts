import '@awesome.me/webawesome/dist/components/button/button.js'
import '@awesome.me/webawesome/dist/components/button/button.styles.js'
import '@awesome.me/webawesome/dist/components/input/input.js'
import '@awesome.me/webawesome/dist/components/input/input.styles.js'
import { createLdoDataset, getDataset, set } from '@ldo/ldo'
import type { ContextDefinition } from 'jsonld'
import { html, LitElement } from 'lit'
import { customElement, property, query } from 'lit/decorators.js'
import { CreateAnswerActivityShapeType } from './ldo/app.shapeTypes'
import type { Answer, CreateAnswerActivity, Poll } from './ldo/app.typings'
import { dataset } from './state/dataset'
import { session, webId } from './state/session'

@customElement('spoll-answer-form')
export class SpollAnswerForm extends LitElement {
  @property({ attribute: false }) poll!: Poll
  @query('form') form!: HTMLFormElement

  private handleSubmit = async (event: SubmitEvent) => {
    event.preventDefault()
    const form = event.target as HTMLFormElement
    const formdata = new FormData(form)
    const data = Object.fromEntries(formdata.entries()) as { answer: string }

    const ldods = createLdoDataset()
    const activity = ldods
      .usingType(CreateAnswerActivityShapeType)
      .fromSubject('#activity')

    Object.assign(activity, {
      type: set({ '@id': 'Create' }),
      actor: { '@id': webId.get()! },
      object: {
        // '@id': '#id',
        type: set({ '@id': 'Answer' }),
        content: data.answer,
        replyOf: { '@id': this.poll['@id'] } as Poll,
      } as Answer,
    } satisfies CreateAnswerActivity)

    const jsonld = await import('jsonld')

    const jld = await jsonld.fromRDF(getDataset(activity))

    const frame = {
      '@context': [
        'https://www.w3.org/ns/activitystreams',
        {
          tsioc: 'http://rdfs.org/sioc/types#',
          sioc: 'http://rdfs.org/sioc/ns#',
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

    if (!this.poll?.inbox?.['@id']) throw new Error('Inbox not found!')

    const inboxResponse = await session.authFetch(this.poll.inbox['@id'], {
      method: 'POST',
      headers: { 'content-type': 'application/ld+json' },
      body: JSON.stringify(compacted),
    })

    if (!inboxResponse.ok) throw new Error('Writing to inbox not successful')

    const presource = dataset.getResource(this.poll['@id']!)
    const presult = await presource.read()
    if (presult.isError) throw presult
    this.form.reset()
  }
  render() {
    return html`<form @submit=${this.handleSubmit}>
      <wa-input name="answer" label="Answer the question"></wa-input>
      <wa-button type="submit">Post answer</wa-button>
    </form>`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'spoll-answer-form': SpollAnswerForm
  }
}
