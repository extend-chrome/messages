import { chrome } from '@bumble/jest-chrome'
import delay from 'delay'

import { _getListener, _listeners } from '../../src/ListenerMap'
import { useScope } from '../../src/scope'
import {
  AsyncMessageListener,
  CoreMessage,
  CoreResponse,
} from '../../src/types'

const scope = 'test'
const messages = useScope(scope)

console.error = jest.fn()

afterEach(() => {
  jest.clearAllMocks()
  _listeners.clear()
  chrome.runtime.onMessage.clearListeners()
})

const message = {
  greeting: 'hello',
}
const coreMessage: CoreMessage = {
  async: true,
  target: null,
  payload: message,
  scope,
}
const sender = {} // Not used directly by @bumble/messages
const response = {
  greeting: 'goodbye',
}

const listener: AsyncMessageListener = (message, sender, sendResponse) => {
  sendResponse(response)
}
const listenerSpy = jest.fn(listener) as AsyncMessageListener
const sendResponse = jest.fn()

const triggerOnMessage = () => {
  chrome.runtime.onMessage.callListeners(coreMessage, sender, sendResponse)
}

test('listens to runtime.onMessage', () => {
  messages.on(listenerSpy)
  expect(chrome.runtime.onMessage.hasListeners()).toBe(true)
  expect(listenerSpy).not.toBeCalled()

  triggerOnMessage()
  expect(listenerSpy).toBeCalled()
})

test('adds listener to _listeners Map', () => {
  messages.on(listenerSpy)

  expect(_getListener(scope, listenerSpy)).toBeDefined()
})

test('internal listener returns true', () => {
  messages.on(listenerSpy)

  const _listener = _getListener(scope, listenerSpy)

  expect(_listener).toBeDefined()
  expect(_listener).toBeInstanceOf(Function)

  if (_listener) {
    expect(_listener(coreMessage, sender, sendResponse)).toBe(true)
  }
})

test('listener receives CoreMessage payload', () => {
  messages.on(listenerSpy)
  triggerOnMessage()

  expect(listenerSpy).toBeCalledWith(message, sender, expect.any(Function))
})

describe('sendResponse', () => {
  test('respond calls sendResponse from runtime.onMessage', () => {
    messages.on(listenerSpy)
    chrome.runtime.onMessage.callListeners(coreMessage, sender, sendResponse)

    expect(sendResponse).toBeCalled()
  })

  test('respond calls sendResponse with a CoreResponse', () => {
    messages.on(listenerSpy)
    chrome.runtime.onMessage.callListeners(coreMessage, sender, sendResponse)

    const expectedResponse: CoreResponse = {
      payload: response,
      success: true,
    }

    expect(sendResponse).toBeCalledWith(expectedResponse)
  })

  test.skip('calls sendResponse with error if callback throws', () => {
    const message = 'something went wrong'
    const listenerSpy = jest.fn(() => {
      throw new Error(message)
    })

    const response: CoreResponse = {
      success: false,
      payload: { greeting: message },
    }

    messages.on(listenerSpy)
    chrome.runtime.onMessage.callListeners(coreMessage, sender, sendResponse)

    expect(sendResponse).toBeCalledWith(response)
  })

  test.skip('calls sendResponse with error if callback rejects', async () => {
    const message = 'something went wrong'
    const listenerSpy = jest.fn(() => Promise.reject(new Error(message)))

    const response: CoreResponse = {
      success: false,
      payload: { greeting: message },
    }

    messages.on(listenerSpy)
    chrome.runtime.onMessage.callListeners(coreMessage, sender, sendResponse)

    await delay(100)

    // expect(console.error).toBeCalled()
    expect(sendResponse).toBeCalledWith(response)
  })
})

describe('message filtering', () => {
  test('receives async messages', () => {
    const listener = jest.fn((m, s, r) => {})
    const respondSpy = jest.fn()

    messages.on(listener)
    chrome.runtime.onMessage.callListeners(coreMessage, sender, respondSpy)

    expect(listener).toBeCalled()
    expect(respondSpy).not.toBeCalled()
  })

  test('ignores one-way messages', () => {
    const oneWayMessage: CoreMessage = {
      async: false,
      payload: message,
      target: null,
      scope,
    }

    const listener = jest.fn((m, s, r) => {})
    const respondSpy = jest.fn()

    messages.on(listener)
    chrome.runtime.onMessage.callListeners(oneWayMessage, sender, respondSpy)

    expect(listener).not.toBeCalled()
  })

  test('receives messages for own target name', () => {
    const target = 'background'
    const coreMessage: CoreMessage = {
      async: true,
      payload: message,
      target: target,
      scope,
    }

    const listener = jest.fn((m, s, r) => {})
    const respondSpy = jest.fn()

    messages.on(listener, target)
    chrome.runtime.onMessage.callListeners(coreMessage, sender, respondSpy)

    expect(listener).toBeCalled()
  })

  test('ignores messages for other targets', () => {
    const target = 'background'
    const coreMessage: CoreMessage = {
      async: true,
      payload: message,
      target: 'options',
      scope,
    }

    const listener = jest.fn((m, s, r) => {})
    const respondSpy = jest.fn()

    messages.on(listener)
    chrome.runtime.onMessage.callListeners(coreMessage, sender, respondSpy)

    expect(listener).not.toBeCalled()
  })

  test('receives general messages if no target name', () => {
    const coreMessage: CoreMessage = {
      async: true,
      payload: message,
      target: null,
      scope,
    }

    const listener = jest.fn((m, s, r) => {})
    const respondSpy = jest.fn()

    messages.on(listener)
    chrome.runtime.onMessage.callListeners(coreMessage, sender, respondSpy)

    expect(listener).toBeCalled()
  })

  test('ignores targeted messages if no target name', () => {
    const coreMessage: CoreMessage = {
      async: true,
      payload: message,
      target: 'options',
      scope,
    }

    const listener = jest.fn((m, s, r) => {})
    const respondSpy = jest.fn()

    messages.on(listener)
    chrome.runtime.onMessage.callListeners(coreMessage, sender, respondSpy)

    expect(listener).not.toBeCalled()
  })

  test('ignores messages for other scopes', () => {
    const target = 'background'
    const coreMessage: CoreMessage = {
      async: true,
      payload: message,
      target: 'options',
      scope: 'other scope',
    }

    const listener = jest.fn((m, s, r) => {})
    const respondSpy = jest.fn()

    messages.on(listener)
    chrome.runtime.onMessage.callListeners(coreMessage, sender, respondSpy)

    expect(listener).not.toBeCalled()
  })
})
