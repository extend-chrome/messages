/**
 * Designate the extension script to receive the message.
 *
 * Can be a default frame name ("background", "options", or "popup"),
 * a custom frame name, or a content script tab id.
 */
type TargetName =
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
interface CoreMessage {
  async: boolean
  target: TargetName | null
  payload: MessagePayload
}

interface MessagePayload {
  greeting: string
  [prop: string]: any
}

/**
 * Pass back to a script through a port.
 * Must contain only JSON compatible data.
 *
 * Must have the same message id as initial Message.
 */
interface CoreResponse {
  success: boolean
  payload: MessagePayload
}

interface MessageListener {
  (
    message: MessagePayload,
    sender: chrome.runtime.MessageSender,
  ): void
}

interface AsyncMessageListener {
  (
    message: MessagePayload,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response?: any) => void,
  ): void
}

interface CoreListener {
  (
    coreMessage: CoreMessage,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response?: any) => void,
  ): void
}
