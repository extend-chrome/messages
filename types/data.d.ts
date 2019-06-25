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
interface JsonifiableMessage {
  id: string
  target: number | string
  payload: JsonifiableData
  only: boolean
}

/**
 * Private interface.
 *
 * Pass back to a script through a port.
 * Must contain only JSON compatible data.
 *
 * Must have the same message id as initial Message.
 */
interface JsonifiableResponse {
  id: string
  target: number | string
  payload: JsonifiableData
  success: boolean
}

/**
 * Default names for extension frames, aka, privileged scripts.
 */
declare enum FrameName {
  'background',
  'options',
  'popup',
}

/**
 * Designate the extension script to receive the message.
 *
 * Can be a default frame name ("background", "options", or "popup"),
 * a custom frame name, or a content script tab id.
 */
type TargetName = FrameName | number | string
