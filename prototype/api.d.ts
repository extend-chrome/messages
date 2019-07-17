/**
 * Send a message to another extension script.
 * If specified, the target must be listening to receive the message.
 *
 * __Extension Pages:__ Optional. Use the frame name of the extension page (`background`, `options`, or `popup`), or a custom value.
 *
 * __Content Scripts:__ Required. Use the tab id of the content script.
 *
 * __Other Extensions:__ Sending a message to another extension is not currently supported.
 */
type SendMessageAsync = (
  message: JsonifiableData,
  target?: TargetName,
  sender?: TargetName,
) => Promise<JsonifiableData>

/**
 * Send a message to another extension script.
 * If specified, the target must be listening to receive the message.
 *
 * __Extension Pages:__ Optional. Use the frame name of the extension page (`background`, `options`, or `popup`), or a custom value.
 *
 * __Content Scripts:__ Required. Use the tab id of the content script.
 *
 * __Other Extensions:__ Sending a message to another extension is not currently supported.
 */
type SendMessage = (
  message: JsonifiableData,
  target?: TargetName,
) => Promise<void>

/**
 * Event listener for the corresponding message type
 * (`on` for `send`, `asyncOn` for `asyncSend`).
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
 * Send a response back to the script that sent the original message.
 * The sender will resolve with the response if that page is still open.
 *
 * Use `sendResponse(response, false)` to cause the sender to reject with `response`.
 */
type SendResponse = (
  response: JsonifiableData,
  success?: boolean,
) => void
