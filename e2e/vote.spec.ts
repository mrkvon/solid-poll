import { expect, test } from '@playwright/test'
import { createRandomUser, signin } from './helpers/account'
import { bot, createAnswer, createPublicPoll } from './helpers/poll'

test.describe('Vote for answer', () => {
  test('add a vote', async ({ page }) => {
    // let there be a poll with 3 answers
    const asking = await createRandomUser()
    const answering = await createRandomUser()
    const voting = await createRandomUser()
    const poll = await createPublicPoll({ user: asking, bot })
    for (let i = 0; i < 3; ++i) {
      const answer = await createAnswer({ poll, asking, answering })
      poll.answers.set(answer.uri, answer)
    }

    await signin(page, voting)
    // go to poll page
    await page.goto(`/polls/${encodeURIComponent(poll.uri)}`)
    // it should be possible to add a vote to one of the answers
    const answer = page.getByTestId('poll-answer').nth(1)
    // TODO this should start at 1 (vote from the answerer themself)
    await expect(answer.getByTestId('poll-answer-votes')).toContainText('0')
    await answer.getByRole('button', { name: 'vote' }).click()
    // the vote should appear
    await expect(answer.getByTestId('poll-answer-votes')).toContainText('1')
  })
  test.fixme('add a vote with optional detail text', () => {})
  test.fixme('update a vote', () => {})
  test.fixme('remove a vote', () => {})
  test.fixme('can vote only once', () => {})
  test.fixme("do not edit or remove other person's vote", () => {})
  test.fixme('anonymous user can not vote', () => {})
})
