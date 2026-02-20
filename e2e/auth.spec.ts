import { expect, test } from '@playwright/test'
import { createRandomUser, signin, type User } from './helpers/account'

test.describe('Auth', () => {
  let user: User

  test.beforeEach(async () => {
    user = await createRandomUser({ oidcIssuer: 'http://localhost:4000' })
  })

  test('sign in with oidcIssuer', async ({ page }) => {
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
  })
  test.fixme('sign in with webId', async () => {})
  test('sign out', async ({ page }) => {
    await signin(page, user)

    await expect(
      page.getByRole('button', { name: 'Sign in' }),
    ).not.toBeVisible()
    await page.getByRole('button', { name: 'Sign out' }).click()
    await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible()
  })
  test.fixme('redirect to previous url after signin', () => {})
  test.fixme('redirect to previous url after reload', () => {})
})
