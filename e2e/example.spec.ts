import { expect, test } from '@playwright/test'

test('App is running', async ({ page }) => {
  await page.goto('http://localhost:5173/')
  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle('app')
})

test('Agent is running', async ({ page }) => {
  await page.goto('http://localhost:3000')

  // Expects page to have a heading with the name of Installation.
  await expect(page.getByText('hello world')).toBeVisible()
})
