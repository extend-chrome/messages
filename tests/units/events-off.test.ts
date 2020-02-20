import { chrome } from '@bumble/jest-chrome'
import { _getListener, _listeners } from '../../src/ListenerMap'
import { useScope } from '../../src/scope'
import { AsyncMessageListener, MessageListener } from '../../src/types'

const scope = 'test'
const messages = useScope(scope)

afterEach(() => {
  jest.clearAllMocks()
  _listeners.clear()
})

test('removes messages.on listener', () => {
  const listener = jest.fn() as MessageListener
  const asyncListener = jest.fn((x, y, z) => {}) as AsyncMessageListener

  messages.on(listener)
  messages.on(asyncListener)
  messages.off(listener)

  expect(chrome.runtime.onMessage.hasListener(listener)).toBe(false)

  const _listener = _getListener(scope, listener)
  const _asyncListener = _getListener(scope, asyncListener)

  expect(_listener).toBeUndefined()
  expect(_asyncListener).toBeDefined()
})

test('removes messages.asyncOn listener', () => {
  const listener = jest.fn() as MessageListener
  const asyncListener = jest.fn((x, y, z) => {}) as AsyncMessageListener

  messages.on(listener)
  messages.on(asyncListener)
  messages.off(asyncListener)

  expect(chrome.runtime.onMessage.hasListener(asyncListener)).toBe(false)

  const _listener = _getListener(scope, listener)
  const _asyncListener = _getListener(scope, asyncListener)

  expect(_listener).toBeDefined()
  expect(_asyncListener).toBeUndefined()
})
