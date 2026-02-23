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
