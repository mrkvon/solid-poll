import { Router } from '@lit-labs/router'
import { html, LitElement } from 'lit'
import { customElement } from 'lit/decorators.js'
import './spoll-create.js'

@customElement('spoll-router')
export class SpollRouter extends LitElement {
  private router = new Router(this, [
    {
      path: '/',
      render: () =>
        html`<wa-button href="/create"
          ><wa-icon name="plus" label="Create poll"></wa-icon
        ></wa-button>`,
    },
    {
      path: '/create',
      render: () => html`<spoll-create></spoll-create>`,
    },
    {
      path: '/polls/:uri',
      render: params => html`${decodeURIComponent(params.uri!)}`,
    },
    { path: '/*', render: () => html`404` },
  ])

  render() {
    return this.router.outlet()
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'spoll-router': SpollRouter
  }
}
