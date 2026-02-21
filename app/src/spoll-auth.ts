import '@awesome.me/webawesome/dist/components/button/button.js'
import '@awesome.me/webawesome/dist/components/button/button.styles.js'
import '@awesome.me/webawesome/dist/components/icon/icon.js'
import '@awesome.me/webawesome/dist/components/icon/icon.styles.js'
import '@awesome.me/webawesome/dist/components/spinner/spinner.js'
import '@awesome.me/webawesome/dist/components/spinner/spinner.styles.js'
import '@awesome.me/webawesome/dist/styles/themes/default.css'
import { SignalWatcher } from '@lit-labs/signals'
import { LitElement, css, html } from 'lit'
import { customElement } from 'lit/decorators.js'
import './spoll-auth-dialog.js'
import { init, isActive, isLoading, session, webId } from './state/session.js'

@customElement('spoll-auth')
export class SpollAuth extends SignalWatcher(LitElement) {
  async connectedCallback() {
    super.connectedCallback()
    await init()
  }

  render() {
    if (isLoading.get()) return html`<wa-spinner></wa-spinner>`
    else if (isActive.get())
      return html`<span>${webId.get()}</span>
        <wa-button @click=${() => session.logout()}
          ><wa-icon name="right-from-bracket" label="Sign out"></wa-icon
        ></wa-button>`
    else return html`<spoll-auth-dialog></spoll-auth-dialog>`
  }

  static styles = css``
}

declare global {
  interface HTMLElementTagNameMap {
    'spoll-auth': SpollAuth
  }
}
