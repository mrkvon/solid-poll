import { expect, Page } from '@playwright/test'
import { v7 } from 'css-authn'
import { randomUUID } from 'node:crypto'

export interface User {
  account: Awaited<ReturnType<typeof v7.createAccount>>
  fetch: typeof globalThis.fetch
}

export async function createRandomUser({
  oidcIssuer = 'http://localhost:4000',
}: {
  oidcIssuer?: string
} = {}): Promise<User> {
  const id = randomUUID()

  const account = await v7.createAccount({
    username: id,
    password: 'correcthorsebatterystaples',
    email: `${id}@example.com`,
    oidcIssuer,
  })
  const authFetch = await v7.getAuthenticatedFetch(account)

  return { account, fetch: authFetch }
}

export async function signin(page: Page, user: User) {
  // go to homepage
  await page.goto('/')
  // click sign in
  await page.getByRole('button', { name: 'Sign in' }).click()
  // select OIDC issuer
  await page
    .getByRole('textbox', { name: 'identity provider or webid' })
    .fill(user.account.oidcIssuer)
  await page.getByRole('button', { name: 'continue' }).click()
  await expect(page).toHaveURL(url =>
    user.account.oidcIssuer.startsWith(url.origin),
  )
  // do the authentication redirect dance
  await page.getByRole('textbox', { name: 'Email' }).fill(user.account.email)
  await page
    .getByRole('textbox', { name: 'Password' })
    .fill(user.account.password)
  await page.getByRole('button', { name: 'Log in' }).click()

  await page.getByRole('button', { name: 'Authorize' }).click()

  // should be redirected back
  await expect(page).toHaveURL('/')

  // check that I'm signed in
  await expect(page.getByText(user.account.webId)).toBeVisible()
}
