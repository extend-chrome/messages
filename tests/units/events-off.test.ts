import { useScope } from '../../src/scope'

import { _listeners, _getListener } from '../../src/ListenerMap'

import * as chrome from 'sinon-chrome'
import assert from 'power-assert'
import {
  AsyncMessageListener,
  MessageListener,
} from '../../src/types'

const scope = 'test'
const messages = useScope(scope)

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

test('removes messages.on listener', () => {
  const listener = jest.fn() as MessageListener
  const asyncListener = jest.fn(
    (x, y, z) => {},
  ) as AsyncMessageListener

  messages.on(listener)
  messages.on(asyncListener)
  messages.off(listener)

  assert(
    chrome.runtime.onMessage.removeListener.called,
    'chrome.runtime.onMessage.removeListener was not called',
  )

  const _listener = _getListener(scope, listener)
  const _asyncListener = _getListener(scope, asyncListener)

  expect(_listener).toBeUndefined()
  expect(_asyncListener).toBeDefined()
})

test('removes messages.asyncOn listener', () => {
  const listener = jest.fn() as MessageListener
  const asyncListener = jest.fn(
    (x, y, z) => {},
  ) as AsyncMessageListener

  messages.on(listener)
  messages.on(asyncListener)
  messages.off(asyncListener)

  assert(
    chrome.runtime.onMessage.removeListener.called,
    'chrome.runtime.onMessage.removeListener was not called',
  )

  const _listener = _getListener(scope, listener)
  const _asyncListener = _getListener(scope, asyncListener)

  expect(_listener).toBeDefined()
  expect(_asyncListener).toBeUndefined()
})
