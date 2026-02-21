import '@awesome.me/webawesome/dist/components/button/button.js'
import '@awesome.me/webawesome/dist/components/button/button.styles.js'
import '@awesome.me/webawesome/dist/components/dialog/dialog.js'
import type WaDialog from '@awesome.me/webawesome/dist/components/dialog/dialog.js'
import '@awesome.me/webawesome/dist/components/dialog/dialog.styles.js'
import '@awesome.me/webawesome/dist/components/icon/icon.js'
import '@awesome.me/webawesome/dist/components/icon/icon.styles.js'
import '@awesome.me/webawesome/dist/components/input/input.js'
import '@awesome.me/webawesome/dist/components/input/input.styles.js'
import '@awesome.me/webawesome/dist/styles/themes/default.css'
import { LitElement, css, html } from 'lit'
import { customElement, query } from 'lit/decorators.js'
import { session } from './state/session'

@customElement('spoll-auth-dialog')
export class SpollAuthDialog extends LitElement {
  @query('wa-dialog') dialog!: WaDialog

  private _handleSigninTrigger = () => {
    this.dialog.open = true
  }

  private _handleSigninSubmit = async (event: SubmitEvent) => {
    event.preventDefault()
    const form = event.target as HTMLFormElement
    const data = new FormData(form)

    const oidcIssuerOrWebid = data.get('oidc-issuer-or-webid') as string

    try {
      const response = await fetch(
        new URL('.well-known/openid-configuration', oidcIssuerOrWebid),
      )
      if (!response.ok) throw new Error('')
      await session.login(oidcIssuerOrWebid, window.location.href)
    } catch (e) {
      // TODO implement fetching oidcIssuer from webId
      alert(e instanceof Error ? e.message : e)
      throw e
    }
  }

  render() {
    return html`<wa-button @click=${this._handleSigninTrigger}
        ><wa-icon name="right-to-bracket" label="Sign in"></wa-icon
      ></wa-button>
      <wa-dialog light-dismiss title="Sign in">
        <form @submit=${this._handleSigninSubmit}>
          <wa-input
            label="Your Solid identity provider or WebID"
            name="oidc-issuer-or-webid"
          ></wa-input>
          <wa-button type="submit">Continue</wa-button>
        </form>
      </wa-dialog>`
  }

  static styles = css``
}

declare global {
  interface HTMLElementTagNameMap {
    'spoll-auth-dialog': SpollAuthDialog
  }
}
