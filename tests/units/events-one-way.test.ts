import { chrome } from '@bumble/jest-chrome'
import { _getListener, _listeners } from '../../src/ListenerMap'
import { getScope } from '../../src/scope'
import { CoreMessage, MessageListener } from '../../src/types'

const addListenerSpy = jest.spyOn(chrome.runtime.onMessage, 'addListener')

const scope = 'test'
const messages = getScope(scope)

const payload = {
  greeting: 'hello',
}
const coreMessage: CoreMessage = {
  async: false,
  payload,
  scope,
  tabId: null,
}

const sender = {} // Not used directly by @extend-chrome/messages
const sendResponse = jest.fn()

afterEach(() => {
  jest.clearAllMocks()
  _listeners.clear()
})

test('listens to runtime.onMessage', () => {
  const listener = jest.fn() as MessageListener

  messages.on(listener)

  expect(addListenerSpy).toBeCalled()
  expect(listener).not.toBeCalled()

  const _listener = _getListener(scope, listener)
  expect(_listener).toBeDefined()

  chrome.runtime.onMessage.callListeners(coreMessage, sender, sendResponse)

  expect(listener).toBeCalled()
})

test('internal listener returns false', () => {
  const listener = jest.fn()
  const respond = jest.fn()

  messages.on(listener)

  const _listener = _getListener(scope, listener)

  if (_listener) {
    expect(_listener).toBeInstanceOf(Function)
    expect(_listener(coreMessage, sender, respond)).toBe(false)
  } else {
    expect(_listener).toBeDefined()
  }
})

test('listener receives CoreMessage payload', () => {
  const listener = jest.fn()

  messages.on(listener)
  chrome.runtime.onMessage.callListeners(coreMessage, sender, sendResponse)

  expect(listener).toBeCalledWith(coreMessage.payload, sender)
})

test('adds listener to _listeners Map', () => {
  const listener = jest.fn()

  messages.on(listener)

  expect(_getListener(scope, listener)).toBeDefined()
})

describe('filtering', () => {
  test('receives one-way messages', () => {
    const listener = jest.fn()

    messages.on(listener)
    chrome.runtime.onMessage.callListeners(coreMessage, sender, sendResponse)

    expect(listener).toBeCalled()
    expect(sendResponse).not.toBeCalled()
  })

  test('ignores async messages', () => {
    const asyncMessage: CoreMessage = {
      async: true,
      payload: payload,
      scope,
      tabId: null,
    }

    const listener = jest.fn()

    messages.on(listener)
    chrome.runtime.onMessage.callListeners(asyncMessage, sender, sendResponse)

    expect(listener).not.toBeCalled()
  })

  test('ignores messages for other scopes', () => {
    const coreMessage: CoreMessage = {
      async: false,
      payload: payload,
      scope: 'another scope',
      tabId: null,
    }

    const listener = jest.fn()

    messages.on(listener)
    chrome.runtime.onMessage.callListeners(coreMessage, sender, sendResponse)

    expect(listener).not.toBeCalled()
  })
})
