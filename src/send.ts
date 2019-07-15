import { uuidv4 as uuid } from './uuidv4'
import { connectTo } from './connect'
import { frameName } from './frames'

/**
 * Send a message to another script. Use when you need to get a response.
 *
 * @returns A promise that resolves when the event listener calls `sendResponse`, or rejects when the event listener throws an error.
 * @param message Send any JSON-ifiable data.
 * @param target "background", "options", "popup", or a custom target name as a `string` or a tab id as a `number`.
 */
export const send: SendMessage = (message, target, sender) =>
  new Promise(async (resolve, reject) => {
    try {
      const port = await connectTo(target)

      const _message: RespondableMessage = {
        id: uuid(),
        payload: message,
        target,
        sender: sender || frameName,
      }

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
          } else {
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
  new Promise(async (resolve, reject) => {
    try {
      const port = await connectTo(target)

      const _message: CoreMessage = {
        id: uuid(),
        payload: message,
        target,
      }

      port.postMessage(_message)

      resolve()
    } catch (error) {
      reject(error)
    }
  })
