import { _getListener, _removeListener, _setListener } from './ListenerMap'
import {
  AsyncMessageListener,
  CoreListener,
  CoreResponse,
  MessageListener,
} from './types'

export const scopeOn = (scope: string) => (callback: MessageListener) => {
  const listener: CoreListener = (message, sender) => {
    if (message.async || message.scope !== scope) {
      return false
    }

    try {
      callback(message.payload, sender)
    } catch (error) {
      // Log listener error
      console.error('Uncaught error in chrome.runtime.onMessage listener')
      console.error(error)
    }

    return false
  }

  chrome.runtime.onMessage.addListener(listener)
  _setListener(scope, callback, listener)
}

export const scopeAsyncOn = (scope: string) => (
  callback: AsyncMessageListener,
) => {
  const listener: CoreListener = (message, sender, sendResponse) => {
    if (message.async && scope === message.scope) {
      handleMessage()
      return true
    }

    return false

    async function handleMessage() {
      try {
        const respond = (response: any): void => {
          const coreResponse: CoreResponse = {
            success: true,
            payload: response,
          }

          sendResponse(coreResponse)
        }

        await callback(message.payload, sender, respond)
      } catch (error) {
        const response: CoreResponse = {
          success: false,
          payload: {
            greeting: error.message,
          },
        }

        console.error(error)
        sendResponse(response)
      }
    }
  }

  chrome.runtime.onMessage.addListener(listener)
  _setListener(scope, callback, listener)
}

export const scopeOff = (scope: string) => (
  listener: MessageListener | AsyncMessageListener,
) => {
  const _listener = _getListener(scope, listener)

  if (_listener) {
    _removeListener(scope, listener)
    chrome.runtime.onMessage.removeListener(_listener)
  }
}
