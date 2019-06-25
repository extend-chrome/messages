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

/*
  Mock-implementation of chrome.runtime messaging API
*/
export const Port = (
  name: string,
  sender?: chrome.runtime.MessageSender,
): chrome.runtime.Port => {
  const _onMessage = new Set()
  const _onDisconnect = new Set()

  const port: chrome.runtime.Port = {
    onMessage: {
      addListener: jest.fn((cb) => {
        _onMessage.add(cb)
      }),
      removeListener: jest.fn((cb) => {
        _onMessage.delete(cb)
      }),
      getRules: jest.fn(),
      addRules: jest.fn(),
      removeRules: jest.fn(),
      hasListener: jest.fn((cb) => {
        return _onMessage.has(cb)
      }),
      hasListeners: jest.fn(() => {
        return _onMessage.size > 0
      }),
    },

    onDisconnect: {
      addListener: jest.fn((cb) => {
        _onDisconnect.add(cb)
      }),
      removeListener: jest.fn((cb) => {
        _onDisconnect.delete(cb)
      }),
      getRules: jest.fn(),
      addRules: jest.fn(),
      removeRules: jest.fn(),
      hasListener: jest.fn((cb) => {
        return _onDisconnect.has(cb)
      }),
      hasListeners: jest.fn(() => {
        return _onDisconnect.size > 0
      }),
    },

    postMessage: jest.fn(),

    disconnect: jest.fn(),

    name,
  }

  if (sender) {
    port.sender = sender
  }

  return port
}
