interface MessagePayload {
  greeting: string
  [prop: string]: any
}

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
  target: TargetName
  payload: MessagePayload
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
