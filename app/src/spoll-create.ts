import '@awesome.me/webawesome/dist/components/button/button.js'
import '@awesome.me/webawesome/dist/components/button/button.styles.js'
import '@awesome.me/webawesome/dist/components/input/input.js'
import '@awesome.me/webawesome/dist/components/input/input.styles.js'
import '@awesome.me/webawesome/dist/components/textarea/textarea.js'
import '@awesome.me/webawesome/dist/components/textarea/textarea.styles.js'
import { createLdoDataset, set, toTurtle } from '@ldo/ldo'
import { html, LitElement } from 'lit'
import { customElement } from 'lit/decorators.js'
import { PollShapeType } from './ldo/app.shapeTypes'
import type { Poll } from './ldo/app.typings'
import { session, webId } from './session'
import { navigate } from './utils/navigate'

@customElement('spoll-create')
export class SpollCreate extends LitElement {
  private async _handleSubmit(e: SubmitEvent) {
    console.log('submitting')
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const formdata = new FormData(form)
    const data = Object.fromEntries(formdata.entries()) as {
      question: string
      detail: string
      resource: string
    }

    const isContainer = data.resource.endsWith('/')
    const uri = isContainer
      ? new URL(crypto.randomUUID(), data.resource)
      : new URL(data.resource)
    uri.hash = 'poll'

    const poll = createLdoDataset()
      .usingType(PollShapeType)
      .fromSubject(uri.toString())

    Object.assign(poll, {
      '@id': uri.hash,
      type: set({ '@id': 'Question' }, { '@id': 'Poll' }),
      content: data.question,
      description: data.detail || undefined,
      creator: { '@id': webId.get()! },
      created: new Date().toISOString(),
    } satisfies Poll)

    await session.authFetch(data.resource, {
      method: 'PUT',
      headers: {
        'if-none-match': '*',
        'content-type': 'text/turtle',
      },
      body: await toTurtle(poll),
    })
    navigate(`/polls/${encodeURIComponent(uri.toString())}`)
  }

  render() {
    return html`
      <form @submit=${this._handleSubmit}>
        <wa-input name="question" label="Question" required></wa-input>

        <wa-textarea
          name="question-detail"
          label="Details about the question"
        ></wa-textarea>

        <wa-input
          type="url"
          name="resource"
          label="Select solid resource"
          required
        ></wa-input>

        <wa-button type="submit">Create poll</wa-button>
      </form>
    `
  }
}
