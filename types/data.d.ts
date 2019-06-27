type Jsonifiable = string | number | boolean | null

type JsonifiableData =
  | Jsonifiable
  | Array<Jsonifiable>
  | {
      [propName: string]: Jsonifiable
    }

/**
 * Private interface.
 *
 * Use to send a message to another script through a port.
 * Must contain only JSON compatible data.
 */
interface CoreMessage {
  id: string
  target: TargetName
  sender?: TargetName
  payload: JsonifiableData
}

interface RespondableMessage extends CoreMessage {
  sender: TargetName
}

/**
 * Private interface.
 *
 * Pass back to a script through a port.
 * Must contain only JSON compatible data.
 *
 * Must have the same message id as initial Message.
 */
interface CoreResponse {
  id: string
  target: TargetName
  payload: JsonifiableData
  success: boolean
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
