import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import parse from 'parse-link-header'
import { acl, foaf } from 'rdf-namespaces'
import { User } from './account.js'

interface AclRule {
  access: ('Read' | 'Write' | 'Append' | 'Control')[]
  agent?: string
  agentClass?: boolean
  agentGroup?: boolean
  public?: boolean
  fragment?: `#${string}`
}

export async function createAcl({
  uri,
  rules,
  user,
}: {
  uri: string
  rules: AclRule[]
  user: User
}) {
  const resp = await fetch(uri)
  const resource = resp.url

  const parsed = parse(resp.headers.get('link'))

  const aclurl = parsed?.['acl']?.url

  assert(aclurl)

  let aclttl = ''

  for (const rule of rules) {
    const fragment = rule.fragment ?? `#${randomUUID()}`

    aclttl += `<${fragment}> a <${acl.Access}> ;`
    aclttl += `\n<${acl.accessTo}> <${resource}> ;`
    if (rule.public) aclttl += `\n<${acl.agentClass}> <${foaf.Agent}> ;`
    if (rule.agent) aclttl += `\n<${acl.agent}> <${rule.agent}> ;`
    aclttl += `\n<${acl.mode}> ${rule.access.map(a => `<${acl[a]}>`)} .`
  }

  console.log(resource, resp.headers, aclttl)

  await user.fetch(aclurl, {
    method: 'PUT',
    body: aclttl,
    headers: { 'content-type': 'text/turtle' },
  })
}
