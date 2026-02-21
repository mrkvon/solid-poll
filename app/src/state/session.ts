import { computed, signal } from '@lit-labs/signals'
import {
  Session,
  SessionEvents,
  type SessionStateChangeDetail,
} from '@uvdsl/solid-oidc-client-browser'
// Explicitly import the worker URL using Vite's query suffix
import refreshWorkerUrl from '@uvdsl/solid-oidc-client-browser/RefreshWorker?sharedworker&url'

export const session = new Session(undefined, { workerUrl: refreshWorkerUrl })

// Raw signals
export const isLoading = signal(true)
export const isActive = signal(false)
export const webId = signal<string | undefined>(undefined)

// Derived
export const isLoggedIn = computed(() => !isLoading.get() && isActive.get())

// Sync session events → signals
session.addEventListener(SessionEvents.STATE_CHANGE, (event: Event) => {
  if (event instanceof CustomEvent) {
    const detail = event.detail as SessionStateChangeDetail
    isActive.set(detail.isActive)
    webId.set(detail.webId)
    isLoading.set(false)
  }
})

session.addEventListener(SessionEvents.EXPIRATION, () => {
  isActive.set(false)
  webId.set(undefined)
  isLoading.set(false)
})

// Initialize
export async function init() {
  try {
    await session.handleRedirectFromLogin()
    await session.restore()
  } catch {
    // No existing session
  } finally {
    isActive.set(session.isActive)
    webId.set(session.webId)
    isLoading.set(false)
  }
}
