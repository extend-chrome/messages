import { CoreMessage, CoreResponse } from './types'

export const send = (
  message: any,
  target?: string | number,
): Promise<void> =>
  new Promise((resolve, reject) => {
    const coreMessage: CoreMessage = {
      async: false,
      target: target || null,
      payload: message,
    }

    const callback = (response: CoreResponse) => {
      if (chrome.runtime.lastError) {
        const lastError = chrome.runtime.lastError.message
        const noResponse =
          'The message port closed before a response was received'

        if (lastError && lastError.includes(noResponse)) {
          resolve()
        } else {
          reject({ message: lastError })
        }
      } else {
        if (response && !response.success) {
          reject(response.payload)
        } else {
          resolve()
        }
      }
    }

    if (typeof target === 'number') {
      chrome.tabs.sendMessage(target, coreMessage, callback)
    } else {
      chrome.runtime.sendMessage(coreMessage, callback)
    }
  })

export const asyncSend = (
  message: any,
  target?: string | number,
): Promise<any> =>
  new Promise((resolve, reject) => {
    const coreMessage: CoreMessage = {
      async: true,
      target: target || null,
      payload: message,
    }

    const callback = (coreResponse: CoreResponse) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError)
      } else if (coreResponse.success === false) {
        reject(new Error(coreResponse.payload.greeting))
      } else {
        resolve(coreResponse.payload)
      }
    }

    if (typeof target === 'number') {
      chrome.tabs.sendMessage(target, coreMessage, callback)
    } else {
      chrome.runtime.sendMessage(coreMessage, callback)
    }
  })
