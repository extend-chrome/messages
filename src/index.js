import { Observable } from 'rxjs'

const isBackgroundPage = () =>
  location.protocol === 'chrome-extension:' &&
  (location.pathname === '/_generated_background_page.html' ||
    location.pathname ===
      chrome.runtime.getManifest().background.page)

/**
 * Use to send messages between documents
 * (from background to content script, or vice-versa).
 *
 * @memberof message
 * @typedef {Object} Message
 * @property {string} greeting - A constant to identify the message type.
 * @property {number} [tabId] - Identifies the tab to send the message to.
 * @property {}
 */

/**
 * Use to send message between scripts.
 * Can recognize the extension document context (background or content script).
 * Requires tabId property when sending from background page.
 *
 * @memberof message
 * @function send
 * @param {Message} message - A Message object with optional data properties.
 * @returns {Promise<Message>} Resolves if the other side responds.
 *
 * @example
 * message.send({
 *   greeting: 'hello',
 *   tabId: 1234, // Required if sending from background page.
 *   async: true, // Awaiting response
 * })
 *   .then((response) => {
 *     console.log('They said:', response.greeting)
 *   })
 *
 */
export const send = message => {
  if (message.tabId) {
    sendToTab(message)
  } else if (!isBackgroundPage()) {
    throw new TypeError(
      'message.tabId is required to send a message from the background page.',
    )
  } else {
    sendFromTab(message)
  }
}

/**
 * Send a message to the background script.
 * See [Chrome API](https://developer.chrome.com/extensions/runtime#method-sendMessage).
 * And
 * [MDN](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/runtime/sendMessage).
 *
 * @memberof message
 * @function sendFromTab
 * @param {Message} message - A Message object with optional data properties.
 * @returns {Promise<Message>} Resolves if the other side responds.
 *
 * @example
 * message.sendFromTab({ greeting: 'hello', async: true })
 *   .then((response) => {
 *     console.log('They said', response.greeting)
 *   })
 *
 */
export const sendFromTab = message =>
  new Promise((resolve, reject) => {
    try {
      chrome.runtime.sendMessage(message, response => {
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

/**
 * Send a message from the background script to a tab.
 *
 * @memberof message
 * @function sendToTab
 * @param {Message} message - Must have a greeting and tabId property.
 * @returns {Promise<Message>} Resolves if the other side responds.
 *
 * @example
 * message.sendToTab({
 *   greeting: 'hello',
 *   tabId: 1234,
 *   async: true,
 * }).then((response) => {
 *   console.log('They said', response.greeting)
 * })
 */
export const sendToTab = ({ tabId, ...message }) =>
  new Promise((resolve, reject) => {
    try {
      chrome.tabs.sendMessage(tabId, message, response => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError.message)
        } else if (!response.success) {
          reject(response)
        } else {
          resolve(response)
        }
      })
    } catch (error) {
      reject(error)
    }
  })

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
 * @memberof message
 * @function onMessage
 *
 * @example
 * // Synchronous response
 * message.onMessage(({greeting, resolve}) => {
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
 *   // Return a promise
 *   return fetch('https://www.google.com')
 * })
 */
const onMessage = callback => {
  chrome.runtime.onMessage.addListener((message, sender, cb) => {
    try {
      const result = callback(message, sender)

      // Respond to the message
      Promise.resolve(result)
        .then(resolve)
        .catch(reject)
    } catch (error) {
      // Reject if the callback errors
      reject(error)
    }

    // Leave the port open
    return true

    function resolve(response) {
      cb({
        success: true,
        greeting: message.greeting,
        ...(response || {}),
      })
    }

    function reject(reason) {
      if (typeof reason === 'string') {
        // reason is just string
        cb({
          success: false,
          greeting: message.greeting,
          reason,
        })
      } else {
        // reason is Error object
        cb({
          success: false,
          greeting: message.greeting,
          reason: reason.message,
          stack: reason.stack,
          name: reason.name,
        })
      }
    }
  })
}

// Observable
const messages = new Observable(subscriber => {
  const { onMessage } = chrome.runtime

  // Could use a Subject instead of an Observable
  onMessage.addListener(listener)

  // Don't need to unsubscribe from this
  return () => onMessage.removeListener(listener)

  function listener({ async, ...message }, sender, callback) {
    // How can I get the result of the Observable?
    // Would like to handle message async if result is a Promise,
    // resolve immediately if result is anything else
    subscriber.next({
      message,
      sender,
      resolve,
      reject,
    })

    return async

    function resolve(response) {
      callback({
        success: true,
        greeting: message.greeting,
        ...(response || {}),
      })
    }

    function reject(reason) {
      if (typeof reason === 'string') {
        // reason is just string
        callback({
          success: false,
          greeting: message.greeting,
          reason,
        })
      } else {
        // reason is Error object
        callback({
          success: false,
          greeting: message.greeting,
          reason: reason.message,
          stack: reason.stack,
          name: reason.name,
        })
      }
    }
  }
})

/** @namespace */
export const message = {
  send,
  sendFromTab,
  sendToTab,
  messages,
  onMessage,
}
