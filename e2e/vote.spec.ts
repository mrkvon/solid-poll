import { expect, test } from '@playwright/test'
import { createRandomUser, signin, User } from './helpers/account'
import { bot, createAnswer, createPublicPoll, Poll } from './helpers/poll'

test.describe('Vote for answer', () => {
  let asking: User
  let answering: User
  let voting: User
  let poll: Poll

  test.beforeEach(async () => {
    // let there be a poll with 3 answers
    asking = await createRandomUser()
    answering = await createRandomUser()
    voting = await createRandomUser()
    poll = await createPublicPoll({ user: asking, bot })
    for (let i = 0; i < 3; ++i) {
      const answer = await createAnswer({ poll, asking, answering })
      poll.answers.set(answer.uri, answer)
    }
  })

  test.beforeEach(async ({ page }) => {
    await signin(page, voting)
  })

  test('add a vote', async ({ page }) => {
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

  test('remove a vote', async ({ page }) => {
    // go to poll page
    await page.goto(`/polls/${encodeURIComponent(poll.uri)}`)
    // it should be possible to add a vote to one of the answers
    const answer = page.getByTestId('poll-answer').nth(1)
    // TODO this should start at 1 (vote from the answerer themself)
    await expect(answer.getByTestId('poll-answer-votes')).toContainText('0')
    await answer.getByRole('button', { name: 'vote' }).click()
    // the vote should appear
    await expect(answer.getByTestId('poll-answer-votes')).toContainText('1')
    // then remove the vote again
    await answer.getByRole('button', { name: 'vote' }).click()
    await expect(answer.getByTestId('poll-answer-votes')).toContainText('0')
  })
  test.fixme('can vote only once', () => {})
  test.fixme("do not edit or remove other person's vote", () => {})
  test.fixme('anonymous user can not vote', () => {})
})
