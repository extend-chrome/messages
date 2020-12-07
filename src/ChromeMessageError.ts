import { CoreMessage, CoreResponse } from './types'

export class ChromeMessageError extends Error {
  coreMessage: CoreMessage | null
  coreResponse: CoreResponse | null

  constructor({
    coreMessage = null,
    coreResponse = null,
    message = chrome.runtime?.lastError?.message ||
      coreResponse?.payload.greeting ||
      'chrome.runtime.lastError is undefined',
  }: {
    coreMessage?: CoreMessage | null
    coreResponse?: CoreResponse | null
    message?: string
  }) {
    super(message)

    this.coreMessage = coreMessage
    this.coreResponse = coreResponse
  }
}
