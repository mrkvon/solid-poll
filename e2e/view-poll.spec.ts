import { expect, test } from '@playwright/test'
import { createRandomUser, User } from './helpers/account'
import { bot, createPublicPoll, Poll } from './helpers/poll'

test.describe('View a poll', () => {
  let user: User
  let poll: Poll
  test.beforeEach(async (/*{ page }*/) => {
    user = await createRandomUser()
    // await signin(page, user)
  })

  // create poll
  test.beforeEach(async () => {
    poll = await createPublicPoll({ user, bot })
  })

  test('see question, author, date, link, detail', async ({ page }) => {
    await page.goto(`/polls/${encodeURIComponent(poll.uri)}`)

    await expect(page.getByTestId('poll-question')).toHaveText(poll.question)
    await expect(page.getByTestId('poll-detail')).toHaveText(poll.detail!)
  })
  test.fixme('see answers', () => {})
  test.fixme('see votes with details', () => {})
  test.fixme('sort answers by highest votes', () => {})
  test.fixme('sort answers by creation time (oldest or newest)', () => {})
})
