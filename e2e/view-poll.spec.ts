import test from '@playwright/test'

test.describe('View a poll', () => {
  test.fixme('see question, date, link, detail', async ({ page }) => {
    await page.goto(`/polls/${encodeURIComponent('asdf')}`)
  })
  test.fixme('see answers', () => {})
  test.fixme('see votes with details', () => {})
  test.fixme('sort answers by highest votes', () => {})
  test.fixme('sort answers by creation time (oldest or newest)', () => {})
})
