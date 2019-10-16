import {
  _getListener,
  _removeListener,
  _setListener,
} from './ListenerMap'
import {
  AsyncMessageListener,
  CoreListener,
  CoreResponse,
  MessageListener,
  TargetName,
} from './types'

export const scopeOn = (scope: string) => (
  callback: MessageListener,
  target?: TargetName,
) => {
  const listener: CoreListener = (message, sender) => {
    if (message.async || message.scope !== scope) {
      return false
    }

    if (
      typeof message.target === 'number' || // is content script
      !message.target || // general message
      message.target === target // is correct target
    ) {
      try {
        callback(message.payload, sender)
      } catch (error) {
        // Log listener error
        console.error(
          'Uncaught error in chrome.runtime.onMessage listener',
        )
        console.error(error)
      }
    }

    return false
  }

  chrome.runtime.onMessage.addListener(listener)
  _setListener(scope, callback, listener)
}

export const scopeAsyncOn = (scope: string) => (
  callback: AsyncMessageListener,
  target?: TargetName,
) => {
  const listener: CoreListener = (
    { async, payload, target: _target, scope: _scope },
    sender,
    sendResponse,
  ) => {
    if (
      async &&
      scope === _scope &&
      (typeof _target === 'number' ||
        !_target ||
        _target === target)
    ) {
      ;(async () => {
        try {
          const respond = (response: any): void => {
            const coreResponse: CoreResponse = {
              success: true,
              payload: response,
            }

            sendResponse(coreResponse)
          }

          await callback(payload, sender, respond)
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
      })()

      return true
    }

    return false
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
