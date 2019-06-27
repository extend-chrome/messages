import { uuidv4 as uuid } from './uuidv4'
import { ports } from './ports'

const setupSend = (
  message: JsonifiableData,
  target: TargetName,
  sender?: TargetName,
): {
  _message: CoreMessage
  port: Port
} => {
  const port = ports.get(target)

  if (!port) {
    throw new Error(`The port "${target}" is not registered`)
  }

  const _message = {
    id: uuid(),
    payload: message,
    target,
    sender,
  }

  return {
    _message,
    port,
  }
}

/**
 * Send a message to another script. Use when you need to get a response.
 *
 * @returns A promise that resolves when the event listener calls `sendResponse`, or rejects when the event listener throws an error.
 * @param message Send any JSON-ifiable data.
 * @param target "background", "options", "popup", or a custom target name as a `string` or a tab id as a `number`.
 */
export const send: SendMessage = (message, target, sender) =>
  new Promise((resolve, reject) => {
    try {
      const { _message, port } = setupSend(
        message,
        target,
        sender,
      )

      port.onMessage.addListener(handleMessage)
      port.postMessage(_message)

      function handleMessage({
        id,
        success,
        payload,
      }: CoreResponse) {
        if (id === _message.id) {
          port.onMessage.removeListener(handleMessage)
          if (success === true) {
            resolve(payload)
          } else if (success === false) {
            reject(payload)
          }
        }
      }
    } catch (error) {
      reject(error)
    }
  })

/**
 * Send a message to another script. Use when you don't need a response.
 *
 * @param message Send any JSON-ifiable data.
 * @param target "background", "options", "popup", or a custom target name as a `string` or a tab id as a `number`.
 */
export const onlySend: SendOnlyMessage = (message, target) =>
  new Promise((resolve, reject) => {
    try {
      const { _message, port } = setupSend(message, target)

      port.postMessage(_message)

      resolve()
    } catch (error) {
      reject(error)
    }
  })
