export const _listeners: Map<
  MessageListener,
  CoreListener | AsyncListener
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

export const onAsync = (
  listener: MessageListener,
  name?: TargetName,
) => {
  const _listener: AsyncListener = (
    { async, payload, target },
    sender,
    sendResponse,
  ) => {
    if (async && (!target || target === name)) {
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
