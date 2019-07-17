export const _listeners: Map<
  MessageListener | AsyncMessageListener,
  CoreListener | AsyncCoreListener
> = new Map()

export const on = (
  listener: MessageListener,
  name?: TargetName,
) => {
  const _listener: CoreListener = (
    { async, payload, target },
    sender,
  ) => {
    if (!async && (!target || target === name)) {
      listener(payload, sender)
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
  const _listener: AsyncCoreListener = (
    { async, payload, target: _target },
    sender,
    sendResponse,
  ) => {
    if (async && (!_target || _target === target)) {
      (async () => {
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
    }

    return true
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
