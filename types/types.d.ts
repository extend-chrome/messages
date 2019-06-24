/**
 * Default names for extension frames, aka, privileged scripts.
 */
declare enum FrameNames {
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
type Target = FrameNames | number | string

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
 * Public API.
 *
 * Send a message to another extension script. The target must be listening via event listener or subscription.
 *
 * __Extension Pages:__ Use the frame name of the extension page (`background`, `options`, or `popup`), or a custom value.
 *
 * __Content Scripts:__ Use the tab id of the content script.
 *
 * __Other Extensions:__ Sending a message to another extension is not currently supported.
 */
type SendMessage = (
  message: JsonifiableData,
  target?: Target,
) => void | Promise<JsonifiableData>

/**
 * Public API.
 *
 * Listen for messages from other scripts.
 */
type AddListener = (
  listener: MessageListener,
  targetName?: string,
) => void

/**
 * Public API.
 *
 * Stop listening for messages from other scripts.
 *
 * Call with the listener function you wish to remove.
 */
type RemoveListener = (listener: MessageListener) => void

/**
 * Public API.
 *
 * Event listener for the corresponding message type
 * (`on` for `send`, `onlyOn` for `onlySend`).
 *
 * `sendResponse` should always be called if it is defined to avoid a possible memory leak.
 *
 * When a page closes, it frees all corresponding resources,
 * so that particular `sendResponse` function will be silently invalidated.
 */
type MessageListener = (
  message: JsonifiableData,
  sendResponse?: SendResponse,
) => void

/**
 * Public API.
 *
 * Send a response back to the script that sent the original message.
 * The sender will resolve with the response if that page is still open.
 *
 * Use `sendResponse(response, false)` to cause the sender to reject with `response`.
 */
type SendResponse = (
  response: JsonifiableData,
  success?: boolean,
) => void

type Jsonifiable = string | number | boolean | null

type JsonifiableData =
  | Jsonifiable
  | Array<Jsonifiable>
  | {
      [propName: string]: Jsonifiable
    }
