import test, { expect } from '@playwright/test'
import { createRandomUser, signin, User } from './helpers/account'
import { bot, createPublicPoll, lipsum, Poll } from './helpers/poll'

test.describe('Answer poll', () => {
  let asking: User
  let answering: User
  let poll: Poll

  test.beforeEach(async () => {
    asking = await createRandomUser()
    poll = await createPublicPoll({ user: asking, bot })
    answering = await createRandomUser()
  })

  test("add answer to the poll by sending activity to poll's inbox", async ({
    page,
  }) => {
    await signin(page, answering)
    await page.goto(`/polls/${encodeURIComponent(poll.uri)}`)

    const answer = lipsum.generateSentences(1)
    await page.getByRole('textbox', { name: 'answer' }).fill(answer)
    await page.getByRole('button', { name: 'post answer' }).click()
    await expect(page.getByTestId('poll-answer').last()).toContainText(answer)
  })

  test.fixme('also include default upvote and optional explanation', () => {})
  test.fixme('edit answer as long as nobody else has voted on it', () => {})
  test.fixme('delete answer as long as nobody else has voted on it', () => {})
  test.fixme("do not edit or remove other person's answer", () => {})
})
