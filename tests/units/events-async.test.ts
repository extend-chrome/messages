import { getScope } from '../../src/scope'

import { _listeners, _getListener } from '../../src/ListenerMap'

import * as chrome from 'sinon-chrome'
import assert from 'power-assert'
import delay from 'delay'
import {
  MessagePayload,
  CoreMessage,
  AsyncMessageListener,
  CoreResponse,
} from '../../src/types'

const scope = 'test'
const messages = getScope(scope)

let lastError: { message: string } | undefined
const lastErrorSpy = jest.fn(() => lastError)
Object.defineProperty(chrome.runtime, 'lastError', {
  get: lastErrorSpy,
})

console.error = jest.fn()

afterEach(() => {
  lastError = undefined
  chrome.reset()
  _listeners.clear()
})

const message: MessagePayload = {
  greeting: 'hello',
}
const coreMessage: CoreMessage = {
  async: true,
  target: null,
  payload: message,
  scope,
}
const sender = {} // Not used directly by @bumble/messages
const response: MessagePayload = {
  greeting: 'goodbye',
}

const listener: AsyncMessageListener = (
  message,
  sender,
  sendResponse,
) => {
  sendResponse(response)
}
const listenerSpy = jest.fn(listener) as AsyncMessageListener
const sendResponse = jest.fn()

const triggerOnMessage = () => {
  chrome.runtime.onMessage.trigger(
    coreMessage,
    sender,
    sendResponse,
  )
}

test('listens to runtime.onMessage', () => {
  messages.on(listenerSpy)
  assert(chrome.runtime.onMessage.addListener.called)
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
  // @ts-ignore
  expect(_listener(coreMessage, sender, sendResponse)).toBe(true)
})

test('listener receives CoreMessage payload', () => {
  messages.on(listenerSpy)
  triggerOnMessage()

  expect(listenerSpy).toBeCalledWith(
    message,
    sender,
    expect.any(Function),
  )
})

describe('sendResponse', () => {
  test('respond calls sendResponse from runtime.onMessage', () => {
    messages.on(listenerSpy)
    chrome.runtime.onMessage.trigger(
      coreMessage,
      sender,
      sendResponse,
    )

    expect(sendResponse).toBeCalled()
  })

  test('respond calls sendResponse with a CoreResponse', () => {
    messages.on(listenerSpy)
    chrome.runtime.onMessage.trigger(
      coreMessage,
      sender,
      sendResponse,
    )

    const expectedResponse: CoreResponse = {
      payload: response,
      success: true,
    }

    expect(sendResponse).toBeCalledWith(expectedResponse)
  })

  test('calls sendResponse with error if callback throws', () => {
    const message = 'something went wrong'
    const listenerSpy = jest.fn((m, s, r) => {
      throw new Error(message)
    })

    const response: CoreResponse = {
      success: false,
      payload: { greeting: message },
    }

    messages.on(listenerSpy)
    chrome.runtime.onMessage.trigger(
      coreMessage,
      sender,
      sendResponse,
    )

    expect(sendResponse).toBeCalledWith(response)
  })

  test('calls sendResponse with error if callback rejects', async () => {
    const message = 'something went wrong'
    const listenerSpy = jest.fn((m, s, r) =>
      Promise.reject(new Error(message)),
    )

    const response: CoreResponse = {
      success: false,
      payload: { greeting: message },
    }

    messages.on(listenerSpy)
    chrome.runtime.onMessage.trigger(
      coreMessage,
      sender,
      sendResponse,
    )

    await delay(100)

    expect(console.error).toBeCalled()
    expect(sendResponse).toBeCalledWith(response)
  })
})

describe('message filtering', () => {
  test('receives async messages', () => {
    const listener = jest.fn((m, s, r) => {})

    messages.on(listener)
    chrome.runtime.onMessage.trigger(coreMessage, sender)

    expect(listener).toBeCalled()
  })

  test('ignores one-way messages', () => {
    const oneWayMessage: CoreMessage = {
      async: false,
      payload: message,
      target: null,
      scope,
    }

    const listener = jest.fn((m, s, r) => {})

    messages.on(listener)
    chrome.runtime.onMessage.trigger(oneWayMessage, sender)

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

    messages.on(listener, target)
    chrome.runtime.onMessage.trigger(coreMessage, sender)

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

    messages.on(listener, target)
    chrome.runtime.onMessage.trigger(coreMessage, sender)

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

    messages.on(listener)
    chrome.runtime.onMessage.trigger(coreMessage, sender)

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

    messages.on(listener)
    chrome.runtime.onMessage.trigger(coreMessage, sender)

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

    messages.on(listener, target)
    chrome.runtime.onMessage.trigger(coreMessage, sender)

    expect(listener).not.toBeCalled()
  })
})
