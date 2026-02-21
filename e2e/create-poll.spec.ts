import test, { expect } from '@playwright/test'
import { createRandomUser, signin, User } from './helpers/account'

test.describe('Create and manage poll', () => {
  let user: User

  // sign in
  test.beforeEach(async ({ page }) => {
    user = await createRandomUser({ oidcIssuer: 'http://localhost:4000' })
    await signin(page, user)
  })

  // visit create page
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: 'create poll' }).click()
    await expect(page).toHaveURL('/create')
  })

  test('select a new resource on my pod to store the poll data', async ({
    page,
  }) => {
    // fill form
    await page
      .getByRole('textbox', { name: 'resource' })
      .fill(new URL('polls/test-poll', user.account.podUrl).toString())
  })

  test.fixme('select a bot that will take care of the poll (or keep default bot)', () => {})

  test('write poll question', async ({ page }) => {
    // fill form
    await page
      .getByRole('textbox', { name: 'question' })
      .first()
      .fill('What is the meaning of life, universe and everything?')
  })

  test('write detailed info or context or explanation about the question', async ({
    page,
  }) => {
    // fill form
    await page
      .getByRole('textbox', { name: 'details' })
      .fill(
        "This is some detailed, multiline description\n\nyes it's multiline.",
      )
  })

  test('save the poll to the file - data, inbox, access control allowing bot to write', async ({
    page,
  }) => {
    const resourceUrl = new URL('polls/test-poll', user.account.podUrl)
    const pollUri = new URL(resourceUrl)
    pollUri.hash = '#poll'

    await page
      .getByRole('textbox', { name: 'question' })
      .first()
      .fill('What is the meaning of life, universe and everything?')
    await page
      .getByRole('textbox', { name: 'details' })
      .fill(
        "This is some detailed, multiline description\n\nyes it's multiline.",
      )
    await page
      .getByRole('textbox', { name: 'resource' })
      .fill(resourceUrl.toString())
    await page.getByRole('button', { name: 'create poll' }).click()

    // redirect to poll URL
    await expect(page).toHaveURL(
      `/polls/${encodeURIComponent(pollUri.toString())}`,
    )

    // check the saved document
    const ttlResponse = await user.fetch(pollUri)
    expect(ttlResponse.ok).toBe(true)
    const ttl = await ttlResponse.text()

    console.log(ttl)
  })

  test.fixme("don't save to existing file", async () => {})
  test.fixme('update the poll', () => {})
  test.fixme('activate and desactivate the poll', () => {})
  test.fixme('other people can not update, activate, desactivate or delete the poll', () => {})
})
