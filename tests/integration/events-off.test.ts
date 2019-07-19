import { messages } from '../../src/index'
import { _listeners } from '../../src/events'

import chrome from 'sinon-chrome'
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

test('removes messages.on listener', () => {
  const listener = jest.fn()
  const asyncListener = jest.fn()

  messages.on(listener)
  messages.asyncOn(asyncListener)
  messages.off(listener)

  assert(
    chrome.runtime.onMessage.removeListener.called,
    'chrome.runtime.onMessage.removeListener was not called',
  )

  const _listener = _listeners.get(listener)
  const _asyncListener = _listeners.get(asyncListener)

  expect(_listener).toBeUndefined()
  expect(_asyncListener).toBeDefined()
})

test('removes messages.asyncOn listener', () => {
  const listener = jest.fn()
  const asyncListener = jest.fn()

  messages.on(listener)
  messages.asyncOn(asyncListener)
  messages.off(asyncListener)

  assert(
    chrome.runtime.onMessage.removeListener.called,
    'chrome.runtime.onMessage.removeListener was not called',
  )

  const _listener = _listeners.get(listener)
  const _asyncListener = _listeners.get(asyncListener)

  expect(_listener).toBeDefined()
  expect(_asyncListener).toBeUndefined()
})
