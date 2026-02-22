import { html, LitElement, type PropertyValues } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { repeat } from 'lit/directives/repeat.js'
import { PollShapeType } from './ldo/app.shapeTypes'
import type { Poll } from './ldo/app.typings'
import { dataset } from './state/dataset'

@customElement('spoll-poll')
export class SpollPoll extends LitElement {
  @property() uri!: string

  @state() poll?: Poll

  protected async willUpdate(changed: PropertyValues) {
    if (changed.has('uri') && this.uri) {
      const resource = dataset.getResource(this.uri)
      if (resource.isPresent()) {
        this.poll = dataset.usingType(PollShapeType).fromSubject(this.uri)
      }
      const result = await resource.read()
      if (result.isError) throw result
      this.poll = dataset.usingType(PollShapeType).fromSubject(this.uri)
    }
  }

  render() {
    return html`
      <dl>
        <dt>uri</dt>
        <dd>${this.poll?.['@id']}</dd>

        <dt>question</dt>
        <dd data-testid="poll-question">${this.poll?.content}</dd>

        <dt>created</dt>
        <dd>${this.poll?.created}</dd>

        <dt>creator</dt>
        <dd>${this.poll?.creator['@id']}</dd>

        <dt>detail</dt>
        <dd data-testid="poll-detail">${this.poll?.description}</dd>

        <dt>answers</dt>
        ${repeat(
          this.poll?.hasReply ?? [],
          answer => answer['@id'],
          answer => html`${answer.content}`,
        )}
      </dl>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'spoll-poll': SpollPoll
  }
}
