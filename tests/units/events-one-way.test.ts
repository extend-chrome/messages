import { _listeners, _getListener } from '../../src/ListenerMap'

import * as chrome from 'sinon-chrome'
import assert from 'power-assert'
import {
  MessagePayload,
  CoreMessage,
  MessageListener,
} from '../../src/types'

import { getScope } from '../../src/scope'

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
  async: false,
  target: null,
  payload: message,
  scope,
}
const sender = {} // Not used directly by @bumble/messages
const sendResponse = jest.fn()
const messageEventArgs = [coreMessage, sender, sendResponse]

test('listens to runtime.onMessage', () => {
  const listener = jest.fn() as MessageListener

  messages.on(listener)

  assert(chrome.runtime.onMessage.addListener.called)

  expect(listener).not.toBeCalled()

  const _listener = _getListener(scope, listener)
  expect(_listener).toBeDefined()

  chrome.runtime.onMessage.trigger(...messageEventArgs)

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

  expect(_getListener(scope, listener)).toBeDefined()
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
      scope,
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
      target,
      scope,
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
      scope,
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
      scope,
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
      scope,
    }

    const listener = jest.fn()

    messages.on(listener)
    chrome.runtime.onMessage.trigger(coreMessage, sender)

    expect(listener).not.toBeCalled()
  })

  test('ignores messages for other scopes', () => {
    const target = 'background'
    const coreMessage: CoreMessage = {
      async: false,
      payload: message,
      target: 'options',
      scope: 'another scope',
    }

    const listener = jest.fn()

    messages.on(listener, target)
    chrome.runtime.onMessage.trigger(coreMessage, sender)

    expect(listener).not.toBeCalled()
  })
})
