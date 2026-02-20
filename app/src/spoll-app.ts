import '@awesome.me/webawesome/dist/styles/themes/default.css'
import { SignalWatcher } from '@lit-labs/signals'
import { LitElement, css, html } from 'lit'
import { customElement } from 'lit/decorators.js'
import './spoll-auth.js'

@customElement('spoll-app')
export class SpollApp extends SignalWatcher(LitElement) {
  render() {
    return html`<header>Solid Poll <spoll-auth></spoll-auth></header>
      <main></main>
      <footer></footer>`
  }

  static styles = css`
    header {
      display: flex;
      justify-content: space-between;
    }
  `
}

declare global {
  interface HTMLElementTagNameMap {
    'spoll-app': SpollApp
  }
}
