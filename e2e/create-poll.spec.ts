import test, { expect, Page } from '@playwright/test'
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

  test('save the poll data to the file', async ({ page }) => {
    const resourceUrl = new URL('data/polls/test-poll', user.account.podUrl)
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

    // TODO test this

    expect(ttl).toContain('poll')
  })

  test('save access control allowing bot to write and public to read (WAC)', async ({
    page,
  }) => {
    const resourceUrl = new URL('polls/test-poll', user.account.podUrl)
    const pollUri = new URL(resourceUrl)
    pollUri.hash = '#poll'

    await fillForm(page, { resource: resourceUrl.toString() })

    // redirect to poll URL
    await expect(page).toHaveURL(
      `/polls/${encodeURIComponent(pollUri.toString())}`,
    )

    // check ACL
    const aclResponse = await user.fetch(resourceUrl + '.acl')
    expect(aclResponse.status).toBe(200)
    expect(aclResponse.ok).toBe(true)
    const acl = await aclResponse.text()

    // TODO test this
    expect(acl).toContain('Read')
  })
  test.fixme('save access control allowing bot to write and public to read (ACP)', async () => {})
  test.fixme('save the inbox', async () => {})
  test.fixme("don't save to existing file", async () => {})
  test.fixme('update the poll', () => {})
  test.fixme('activate and desactivate the poll', () => {})
  test.fixme('other people can not update, activate, desactivate or delete the poll', () => {})
})

const fillForm = async (page: Page, options: { resource: string }) => {
  await page
    .getByRole('textbox', { name: 'question' })
    .first()
    .fill('What is the meaning of life, universe and everything?')
  await page
    .getByRole('textbox', { name: 'details' })
    .fill("This is some detailed, multiline description\n\nyes it's multiline.")
  await page.getByRole('textbox', { name: 'resource' }).fill(options.resource)
  await page.getByRole('button', { name: 'create poll' }).click()
}
