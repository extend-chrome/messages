import { getFrameName } from './frames'
import { MessagesError } from './port-error'

const _frameName = getFrameName()
const ports: Bumble.Messages.Ports = {}

// FIXME: error if send is called before ports can finish registering
// messages sent on first tick must be queued until registration finishes
const connect = (): void => {
  const port = chrome.runtime.connect({ name: _frameName })

  port.onDisconnect.addListener(() => {
    if (chrome.runtime.lastError) {
      // Do nothing, nobody is listening
      console.log(chrome.runtime.lastError.message)
    }
  })
}

/* -------------------------------------------- */
/*             START TRACKING PORTS             */
/* -------------------------------------------- */

chrome.runtime.onConnect.addListener((port) => {
  let name: string | number

  if (
    port.name === 'content' &&
    port.sender &&
    port.sender.tab &&
    port.sender.tab.id
  ) {
    name = port.sender.tab.id
  } else if (port.name) {
    name = port.name
  } else {
    throw new TypeError('Unable to derive port name')
  }

  if (!ports[name]) {
    ports[name] = port

    port.onDisconnect.addListener((port) => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError)
      }

      console.log('disconnected from', name)

      delete ports[name]
    })

    connect()

    console.log('connected to', name)
  }
})

// Discover other pages
connect()

/**
 * Use to send a message between contexts.
 * Include `message.tabId` to send a message to a content script.
 * Set `message.async` to await a response.
 *
 * @param {Message} message - A Message object with optional data properties.
 * @returns {Promise<MessageResponse>} Will resolve with a response if `message.async`, else will resolve immediately.
 *
 * @example
 * message.send({
 *   greeting: 'hello',
 *   target: 1234, // Send to a specific tab.
 * })
 *   .then((response) => {
 *     console.log('They said:', response.greeting)
 *   })
 *
 * @example
 * message.send({
 *   greeting: 'hello',
 *   target: 'background', // Send to a registered frame.
 * })
 *   .then((response) => {
 *     console.log('They said:', response.greeting)
 *   })
 */
export const send: Bumble.Messages.Send = (message) => {
  if (typeof message.target === 'number') {
    return sendToTab(message)
  } else if (typeof message.target === 'string') {
    return sendToFrame(message)
  } else {
    throw new TypeError(
      'message.target must be of type number or string',
    )
  }
}

/**
 * Send a message to the background script.
 * See [Chrome API](https://developer.chrome.com/extensions/runtime#method-sendMessage).
 * And
 * [MDN](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/runtime/sendMessage).
 *
 * @example
 * message.sendToFrame({ greeting: 'hello', target: 'options' })
 *   .then(() => {
 *     // Resolves immediately to undefined
 *   })
 *
 * @example
 * message.sendToFrame({ greeting: 'hello', async: true, target: 'background' })
 *   .then((response) => {
 *     console.log('They said', response.greeting)
 *   })
 */
export const sendToFrame: Bumble.Messages.Send = (
  message,
  _retries = 0,
) => {
  if (typeof message.target !== 'string') {
    throw new TypeError('message.target must be of type string')
  }

  if (!ports[message.target]) {
    if (_retries < 5) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          try {
            resolve(sendToFrame(message, _retries + 1))
          } catch (error) {
            reject(error)
          }
        }, 100)
      })
    } else {
      return Promise.reject(
        new MessagesError(
          `The ${
            message.target
          } page is not registered, could not connect to port.`,
          ports,
        ),
      )
    }
  }

  if (!message.async) {
    chrome.runtime.sendMessage(message)

    return Promise.resolve(undefined)
  }

  return new Promise((resolve, reject) => {
    try {
      chrome.runtime.sendMessage(message, (response) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError.message)
        } else if (!response.success) {
          reject(response)
        } else {
          resolve(response)
        }
      })
    } catch (err) {
      reject(err)
    }
  })
}

/**
 * Send a message from the background script to a tab.
 *
 * @example
 * message.sendToTab({
 *   greeting: 'hello',
 *   target: 1234,
 * }).then(() => {
 *   // Resolves immediately to undefined
 * })
 *
 * @example
 * message.sendToTab({
 *   greeting: 'hello',
 *   target: 1234,
 *   async: true
 * }).then((response) => {
 *   console.log('They said', response.greeting)
 * })
 */
export const sendToTab: Bumble.Messages.Send = (
  message,
  _retries = 0,
) => {
  if (typeof message.target !== 'number') {
    throw new TypeError('message.target must be of type number')
  }

  if (!ports[message.target]) {
    if (_retries < 5) {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          try {
            resolve(sendToTab(message, _retries + 1))
          } catch (error) {
            reject(error)
          }
        }, 100)
      })
    } else {
      return Promise.reject(
        new MessagesError(
          `The ${
            message.target
          } page is not registered, could not connect to port.`,
          ports,
        ),
      )
    }
  }

  if (!message.async) {
    chrome.runtime.sendMessage(message)

    return Promise.resolve(undefined)
  }

  return new Promise((resolve, reject) => {
    try {
      chrome.tabs.sendMessage(
        // @ts-ignore
        message.target,
        message,
        (response: Bumble.Messages.Response) => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError.message)
          } else if (!response.success) {
            reject(response)
          } else {
            resolve(response)
          }
        },
      )
    } catch (error) {
      reject(error)
    }
  })
}

/**
 * Listen for messages from other tabs/pages.
 *
 * The response Message object will be processed before it is sent:
 * - If there is no error, `message.success = true`.
 * - If there was an error, `message.success = false`
 *   and the error's message and stack will be assigned to the response object.
 * - If `response.greeting` is `undefined`,
 *   the original greeting will be assigned.
 *
 * @example
 * // Synchronous response
 * message.onMessage(({ greeting }) => {
 *   console.log('They said', greeting)
 *
 *   // Return an object
 *   return { greeting: 'Back at you.'}
 * })
 *
 * @example
 * // Asynchronous response
 * message.onMessage(({ greeting }) => {
 *   console.log('They said', greeting)
 *
 *   // Return Promise<Message>
 *   return fetch('https://www.google.com')
 * })
 */
export const onMessage = (
  callback: Bumble.Messages.OnMessageCallback,
  frameName: string = _frameName,
): Bumble.Messages.OnMessageUnsubscribe => {
  chrome.runtime.onMessage.addListener(listener)

  return () => chrome.runtime.onMessage.removeListener(listener)

  function listener(
    { async, ...message }: Bumble.Messages.Message,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response: Bumble.Messages.Response) => void,
  ): boolean {
    if (message.target !== frameName) {
      return false
    }

    try {
      const result = callback(message, sender)

      if (!async) {
        // If the message is not async, close the port
        return false
      } else if (result) {
        // Respond to the message specifically
        Promise.resolve(result)
          .then(resolve)
          .catch(reject)
      } else {
        // Respond to the message generically
        resolve()
      }
    } catch (error) {
      if (!async) {
        console.error('Uncaught error in onMessage callback:')
        console.error(error)

        return false
      }

      // Reject if the callback errors
      reject(error)
    }

    // Leave the port open
    // The callback will always resolve to something
    // If the callback should resolve later, return a promise
    return true

    function resolve(
      response?:
        | Bumble.Messages.Message
        | Bumble.Messages.Response
        | undefined,
    ): void {
      sendResponse({
        success: true,
        greeting: message.greeting,
        ...response,
      })
    }

    function reject(reason: string | Error): void {
      if (typeof reason === 'string') {
        // reason is just string
        sendResponse({
          success: false,
          greeting: message.greeting,
          reason,
        })
      } else {
        // reason is Error object
        sendResponse({
          success: false,
          greeting: message.greeting,
          reason: reason.message,
          stack: reason.stack,
          name: reason.name,
        })
      }
    }
  }
}
