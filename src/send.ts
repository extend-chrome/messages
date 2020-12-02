import { CoreMessage, CoreResponse, SendOptions } from './types'

export const scopeSend = (scope: string) => (
  message: any,
  { tabId, frameId } = {} as SendOptions,
): Promise<void> =>
  new Promise((resolve, reject) => {
    const coreMessage: CoreMessage = {
      async: false,
      tabId: tabId || null,
      payload: message,
      scope,
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

    if (typeof tabId === 'number' && typeof frameId === 'number') {
      chrome.tabs.sendMessage(tabId, coreMessage, { frameId }, callback)
    } else if (typeof tabId === 'number') {
      chrome.tabs.sendMessage(tabId, coreMessage, callback)
    } else {
      chrome.runtime.sendMessage(coreMessage, callback)
    }
  })

export const scopeAsyncSend = (scope: string) => (
  message: any,
  { tabId, frameId } = {} as SendOptions,
): Promise<any> =>
  new Promise((resolve, reject) => {
    const coreMessage: CoreMessage = {
      async: true,
      tabId: tabId || null,
      payload: message,
      scope,
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

    if (typeof tabId === 'number' && typeof frameId === 'number') {
      chrome.tabs.sendMessage(tabId, coreMessage, { frameId }, callback)
    } else if (typeof tabId === 'number') {
      chrome.tabs.sendMessage(tabId, coreMessage, callback)
    } else {
      chrome.runtime.sendMessage(coreMessage, callback)
    }
  })
