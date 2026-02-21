import { createSolidLdoDataset } from '@ldo/connected-solid'
import { session } from './session'

// Create an LdoDataset
export const dataset = createSolidLdoDataset()
// Set the authenticated fetch
dataset.setContext('solid', { fetch: session.authFetch.bind(session) })
