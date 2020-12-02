/**
 * Private interface.
 *
 * Use to send a message to another script through a port.
 * Must contain only JSON compatible data.
 */
export interface CoreMessage {
  async: boolean
  tabId: number | null
  payload: any
  scope: string
}

export interface TypedMessage<T> {
  greeting: string
  data: T
}

/**
 * Pass back to a script through a port.
 * Must contain only JSON compatible data.
 *
 * Must have the same message id as initial Message.
 */
export interface CoreResponse {
  success: boolean
  payload: any
}

export interface MessageListener {
  (message: any, sender: chrome.runtime.MessageSender): void
}

export interface AsyncMessageListener {
  (
    message: any,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response?: any) => void,
  ): void
}

export interface CoreListener {
  (
    coreMessage: CoreMessage,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response?: any) => void,
  ): void
}

/** The tab that sent the message */
export type Sender = chrome.runtime.MessageSender

export type SendOptions = {
  tabId?: number
  frameId?: number
}

export type AsyncSendOptions = SendOptions & {
  async: true
}
