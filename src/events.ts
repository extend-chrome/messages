import { ports } from './ports'
import { createEvent } from './event/create-event'

declare type OnMessageSelector = (
  ownName: TargetName,
  message: RespondableMessage,
  port: Port,
) => any[] | null

export const createOnMessage = (selector: OnMessageSelector) => {
  const onMessage = createEvent(selector, true)

  ports.onMessage.addListener(onMessage.callListeners)

  return onMessage
}

/**
 * Add a listener for messages sent using `messages.send`.
 *
 * The optional targetName may be used to designate a custom name for that listener.
 * Use this targetName as the second argument in `messages.send`.
 *
 * The event listener receives two parameters, the message and the `sendResponse` function.
 * The promise returned by `messages.send` will resolve once `sendResponse` has been called.
 *
 * To avoid memory leaks, `sendResponse` should always be called, even if there is no data to send back.
 */
export const onMessage: CallableNamedEvent<
  (message: JsonifiableData, sendResponse: SendResponse) => void,
  (message: CoreMessage, port: Port) => void
> = createOnMessage((ownName, message, port) => {
  if (message.target !== ownName || !message.sender) {
    return null
  }

  return [message.payload, sendResponse]

  function sendResponse(payload: JsonifiableData) {
    const response: CoreResponse = {
      id: message.id,
      target: message.sender,
      payload,
      success: true,
    }

    // TODO: how to reject?
    port.postMessage(response)
  }
})

/**
 * Add a listener for messages sent using `messages.onlySend`.
 *
 * The optional targetName may be used to designate a custom name for that listener.
 * Use this targetName as the second argument in `messages.onlySend`.
 *
 * The event listener receives one argument, the message.
 */
export const onOnlyMessage: CallableNamedEvent<
  (message: JsonifiableData) => void,
  (message: CoreMessage, port: Port) => void
> = createOnMessage((ownName, message) => {
  if (message.target !== ownName || message.sender) {
    return null
  }

  return [message.payload]
})
