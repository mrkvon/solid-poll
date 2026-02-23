import type { SolidLeaf } from '@ldo/connected-solid'
import { SignalWatcher } from '@lit-labs/signals'
import { css, html, LitElement, type PropertyValues } from 'lit'
import { customElement, property, state } from 'lit/decorators.js'
import { repeat } from 'lit/directives/repeat.js'
import { PollShapeType } from './ldo/app.shapeTypes'
import './spoll-answer-form.js'
import { dataset } from './state/dataset'
import { isLoggedIn } from './state/session'

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
          answer => html`<dd>${answer.content}</dd>`,
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
