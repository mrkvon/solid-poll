import { createApp } from './app.js'
import { isBehindProxy, port, webId } from './config/index.js'

const app = await createApp({ webId, isBehindProxy })

app.listen(port, async () => {
  // eslint-disable-next-line no-console
  console.log(`inbox service is listening on port ${port}`)
})
