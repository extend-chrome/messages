/**
 * Designate the extension script to receive the message.
 *
 * Can be a default frame name ("background", "options", or "popup"),
 * a custom frame name, or a content script tab id.
 */
export type TargetName =
  | 'background'
  | 'popup'
  | 'options'
  | number
  | string

/**
 * Private interface.
 *
 * Use to send a message to another script through a port.
 * Must contain only JSON compatible data.
 */
export interface CoreMessage {
  async: boolean
  target: TargetName | null
  payload: MessagePayload
}

export interface MessagePayload {
  greeting: string
  [prop: string]: any
}

/**
 * Pass back to a script through a port.
 * Must contain only JSON compatible data.
 *
 * Must have the same message id as initial Message.
 */
export interface CoreResponse {
  success: boolean
  payload: MessagePayload
}

export interface MessageListener {
  (
    message: MessagePayload,
    sender: chrome.runtime.MessageSender,
  ): void
}

export interface AsyncMessageListener {
  (
    message: MessagePayload,
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
