import { messages } from '../../src/index'
import { _listeners } from '../../src/events'

import * as chrome from 'sinon-chrome'
import assert from 'power-assert'

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
  async: false,
  target: null,
  payload: message,
}
const sender = {} // Not used directly by @bumble/messages
const sendResponse = jest.fn()
const messageEventArgs = [coreMessage, sender, sendResponse]

test('listens to runtime.onMessage', () => {
  const listener = jest.fn()

  messages.on(listener)

  assert(chrome.runtime.onMessage.addListener.called)
  expect(listener).not.toBeCalled()

  chrome.runtime.onMessage.trigger(...messageEventArgs)

  expect(listener).toBeCalled()
})

test('internal listener returns false', () => {
  const listener = jest.fn()
  const respond = jest.fn()

  messages.on(listener)

  const _listener = _listeners.get(listener)

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
  chrome.runtime.onMessage.trigger(...messageEventArgs)

  expect(listener).toBeCalledWith(
    coreMessage.payload,
    sender,
    // should not receive respond fn
  )
})

test('adds listener to _listeners Map', () => {
  const listener = jest.fn()

  messages.on(listener)

  expect(_listeners.has(listener)).toBe(true)
})

describe('filtering', () => {
  test('receives one-way messages', () => {
    const listener = jest.fn()

    messages.on(listener)
    chrome.runtime.onMessage.trigger(coreMessage, sender)

    expect(listener).toBeCalled()
  })

  test('ignores async messages', () => {
    const asyncMessage: CoreMessage = {
      async: true,
      payload: message,
      target: null,
    }

    const listener = jest.fn()

    messages.on(listener)
    chrome.runtime.onMessage.trigger(asyncMessage, sender)

    expect(listener).not.toBeCalled()
  })

  test('receives messages for own target name', () => {
    const target = 'background'
    const coreMessage: CoreMessage = {
      async: false,
      payload: message,
      target: target,
    }

    const listener = jest.fn()

    messages.on(listener, target)
    chrome.runtime.onMessage.trigger(coreMessage, sender)

    expect(listener).toBeCalled()
  })

  test('ignores messages for other targets', () => {
    const target = 'background'
    const coreMessage: CoreMessage = {
      async: false,
      payload: message,
      target: 'options',
    }

    const listener = jest.fn()

    messages.on(listener, target)
    chrome.runtime.onMessage.trigger(coreMessage, sender)

    expect(listener).not.toBeCalled()
  })

  test('receives general messages if no target', () => {
    const coreMessage: CoreMessage = {
      async: false,
      payload: message,
      target: null,
    }

    const listener = jest.fn()

    messages.on(listener)
    chrome.runtime.onMessage.trigger(coreMessage, sender)

    expect(listener).toBeCalled()
  })

  test('ignores targeted messages if no target', () => {
    const coreMessage: CoreMessage = {
      async: false,
      payload: message,
      target: 'options',
    }

    const listener = jest.fn()

    messages.on(listener)
    chrome.runtime.onMessage.trigger(coreMessage, sender)

    expect(listener).not.toBeCalled()
  })
})
