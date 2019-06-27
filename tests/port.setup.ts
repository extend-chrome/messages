export const Tab = ({
  id,
  index = 0,
  pinned = false,
  highlighted = false,
  windowId = 0,
  active = true,
  incognito = false,
  selected = true,
  discarded = false,
  autoDiscardable = true,
  ...rest
}: {
  id: number
  [propName: string]: any
}): chrome.tabs.Tab => ({
  id,
  index,
  pinned,
  highlighted,
  windowId,
  active,
  incognito,
  selected,
  discarded,
  autoDiscardable,
  ...rest,
})

/**
 * Mock-implementation of [chrome.runtime.Port](https://developer.chrome.com/extensions/runtime#type-Port)
 * @param name Name of port
 * @param [sender] [chrome.runtime.MessageSender](https://developer.chrome.com/extensions/runtime#type-MessageSender)
 */ export const Port = (
  name: string,
  sender?: chrome.runtime.MessageSender,
): chrome.runtime.Port => {
  const _onMessage: Set<
    (
      message: CoreMessage,
      port: chrome.runtime.Port,
    ) => void
  > = new Set()
  const _onDisconnect = new Set()

  const port: chrome.runtime.Port = {
    name,

    /**
     * Fires own onMessage listeners
     */
    postMessage: jest.fn((message: any) => {
      _onMessage.forEach((cb) => {
        cb(message, port)
      })
    }),

    disconnect: jest.fn(),

    onMessage: {
      addListener: jest.fn((cb) => {
        _onMessage.add(cb)
      }),
      hasListener: jest.fn((cb) => {
        return _onMessage.has(cb)
      }),
      hasListeners: jest.fn(() => {
        return _onMessage.size > 0
      }),
      removeListener: jest.fn((cb) => {
        _onMessage.delete(cb)
      }),
      // A Port Event doesn't have rules, but @types/chrome says they do
      getRules: jest.fn(),
      addRules: jest.fn(),
      removeRules: jest.fn(),
    },

    onDisconnect: {
      addListener: jest.fn((cb) => {
        _onDisconnect.add(cb)
      }),
      hasListener: jest.fn((cb) => {
        return _onDisconnect.has(cb)
      }),
      hasListeners: jest.fn(() => {
        return _onDisconnect.size > 0
      }),
      removeListener: jest.fn((cb) => {
        _onDisconnect.delete(cb)
      }),
      // A Port Event doesn't have rules, but @types/chrome says they do
      addRules: jest.fn(),
      getRules: jest.fn(),
      removeRules: jest.fn(),
    },
  }

  if (sender) {
    port.sender = sender
  }

  return port
}
