import '@awesome.me/webawesome/dist/components/button/button.js'
import '@awesome.me/webawesome/dist/components/button/button.styles.js'
import '@awesome.me/webawesome/dist/components/input/input.js'
import '@awesome.me/webawesome/dist/components/input/input.styles.js'
import '@awesome.me/webawesome/dist/components/textarea/textarea.js'
import '@awesome.me/webawesome/dist/components/textarea/textarea.styles.js'
import { commitData } from '@ldo/connected'
import {
  SolidLeaf,
  type SolidContainer,
  type SolidLeafUri,
  type SolidResource,
} from '@ldo/connected-solid'
import { set } from '@ldo/ldo'
import { html, LitElement } from 'lit'
import { customElement } from 'lit/decorators.js'
import { PollShapeType } from './ldo/app.shapeTypes'
import type { Poll } from './ldo/app.typings'
import { dataset } from './state/dataset'
import { webId } from './state/session'
import { navigate } from './utils/navigate'

@customElement('spoll-create')
export class SpollCreate extends LitElement {
  private async _handleSubmit(e: SubmitEvent) {
    e.preventDefault()
    const form = e.target as HTMLFormElement
    const formdata = new FormData(form)
    const data = Object.fromEntries(formdata.entries()) as {
      question: string
      detail: string
      resource: string
    }

    console.log('submitting', data)

    const isContainer = data.resource.endsWith('/')
    const resourceUrl = isContainer
      ? new URL(crypto.randomUUID(), data.resource)
      : new URL(data.resource)

    const subjectUri = new URL(resourceUrl)
    subjectUri.hash = 'poll'

    // const poll = createLdoDataset()
    //   .usingType(PollShapeType)
    //   .fromSubject(uri.toString())

    // Object.assign(poll, {
    //   '@id': uri.hash,
    //   type: set({ '@id': 'Question' }, { '@id': 'Poll' }),
    //   content: data.question,
    //   description: data.detail || undefined,
    //   creator: { '@id': webId.get()! },
    //   created: new Date().toISOString(),
    // } satisfies Poll)

    // await session.authFetch(data.resource, {
    //   method: 'PUT',
    //   headers: {
    //     'if-none-match': '*',
    //     'content-type': 'text/turtle',
    //   },
    //   body: await toTurtle(poll),
    // })
    const resource = dataset.getResource(resourceUrl.toString() as SolidLeafUri)
    await resource.read()
    const poll = dataset.createData(
      PollShapeType,
      subjectUri.toString(),
      resource,
    )
    Object.assign(poll, {
      '@id': subjectUri.toString(),
      type: set({ '@id': 'Question' }, { '@id': 'Poll' }),
      content: data.question,
      description: data.detail || undefined,
      creator: { '@id': webId.get()! },
      created: new Date().toISOString(),
    } satisfies Poll)

    await ensureContainers(resource)
    if (!resource.isAbsent()) {
      throw new Error('Resource already exists. Not writing.')
    }
    const result = await commitData(poll)
    if (result.isError) throw result
    await resource.setWac({
      public: { read: true, write: false, append: false, control: false },
      authenticated: {
        read: false,
        write: false,
        append: false,
        control: false,
      },
      agent: {
        [webId.get()!]: {
          read: true,
          write: true,
          append: true,
          control: true,
        },
      },
    })

    navigate(`/polls/${encodeURIComponent(subjectUri.toString())}`)
  }

  render() {
    return html`
      <form @submit=${this._handleSubmit}>
        <wa-input name="question" label="Question" required></wa-input>

        <wa-textarea
          name="detail"
          label="Details about the question"
        ></wa-textarea>

        <wa-input
          type="url"
          name="resource"
          label="Select solid resource"
          required
        ></wa-input>

        <wa-button type="submit">Create poll</wa-button>
      </form>
    `
  }
}

const ensureContainers = async (resource: SolidResource) => {
  const result = await resource.read()
  if (result.isError) throw result
  if (result.resource instanceof SolidLeaf)
    await ensureContainer(await result.resource.getParentContainer())
  else await ensureContainer(result.resource)
}

const ensureContainer = async (container: SolidContainer) => {
  await container.read()

  if (container.isAbsent()) {
    const parent = await container.getParentContainer()

    if (parent) {
      if (parent.isError) throw parent
      if (!parent.isRootContainer()) {
        await ensureContainer(parent)
      }
    }

    const result = await container.createIfAbsent()
    if (result.isError) throw result
  }
}
