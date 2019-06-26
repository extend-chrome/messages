import { uuidv4 as uuid } from './uuidv4'
import { ports } from './ports'
import { frameName } from './frames'

/**
 * Send a message to another script. Use when you need to get a response.
 *
 * @returns A promise that resolves when the event listener calls `sendResponse`, or rejects when the event listener throws an error.
 * @param message Send any JSON-ifiable data.
 * @param target "background", "options", "popup", or a custom target name as a `string` or a tab id as a `number`.
 */
export const send: SendMessage = (message, target) => {
  const _target = target || frameName
  const port = ports.get(_target)

  if (!port) {
    return Promise.reject(
      new Error(`The port "${_target}" is not registered`),
    )
  }

  const _message: JsonifiableMessage = {
    id: uuid(),
    payload: message,
    target: _target,
    only: false,
  }

  return new Promise((resolve, reject) => {
    try {
      const handleMessage = ({
        id,
        success,
        payload,
      }: JsonifiableResponse) => {
        if (id === _message.id) {
          port.onMessage.removeListener(handleMessage)

          if (success === true) {
            resolve(payload)
          } else if (success === false) {
            reject(payload)
          }
        }
      }

      port.onMessage.addListener(handleMessage)

      port.postMessage(_message)
    } catch (error) {
      reject(error)
    }
  })
}

/**
 * Send a message to another script. Use when you don't need a response.
 *
 * @param message Send any JSON-ifiable data.
 * @param target "background", "options", "popup", or a custom target name as a `string` or a tab id as a `number`.
 */
export const onlySend: SendOnlyMessage = (message, target) => {}
