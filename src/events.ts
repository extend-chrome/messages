export const _listeners: Map<
  MessageListener | AsyncMessageListener,
  CoreListener
> = new Map()

export const on = (
  listener: MessageListener,
  target?: TargetName,
) => {
  const _listener: CoreListener = (message, sender) => {
    if (message.async) {
      return false
    }

    if (
      typeof message.target === 'number' || // is content script
      !message.target || // general message
      message.target === target // is correct target
    ) {
      try {
        listener(message.payload, sender)
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

  chrome.runtime.onMessage.addListener(_listener)
  _listeners.set(listener, _listener)
}

export const asyncOn = (
  listener: AsyncMessageListener,
  target?: TargetName,
) => {
  const _listener: CoreListener = (
    { async, payload, target: _target },
    sender,
    sendResponse,
  ) => {
    if (
      async &&
      (typeof _target === 'number' ||
        !_target ||
        _target === target)
    ) {
      ;(async () => {
        try {
          const respond = (response: MessagePayload): void => {
            const coreResponse: CoreResponse = {
              success: true,
              payload: response,
            }

            sendResponse(coreResponse)
          }

          await listener(payload, sender, respond)
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

  chrome.runtime.onMessage.addListener(_listener)
  _listeners.set(listener, _listener)
}

export const off = (listener: MessageListener) => {
  const _listener = _listeners.get(listener)

  if (_listener) {
    _listeners.delete(listener)
    chrome.runtime.onMessage.removeListener(_listener)
  }
}
