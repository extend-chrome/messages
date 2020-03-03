import { chrome } from '@bumble/jest-chrome'
import { _listeners } from '../../src/ListenerMap'
import { getScope } from '../../src/scope'
import { CoreMessage } from '../../src/types'

const scopeName = 'test scope'
const messages = getScope(scopeName)

afterEach(() => {
  _listeners.clear()
})

test('subscribes to onMessage event', () => {
  expect(_listeners.size).toBe(0)
  messages.stream.subscribe()
  expect(_listeners.size).toBe(1)

  const listeners = _listeners.get(scopeName)
  if (listeners) {
    expect(listeners.size).toBe(2)
  } else {
    expect(listeners).toBeDefined()
  }
})

test('emits correct message tuple', (done) => {
  expect.assertions(4)

  const payload = { abc: 'xyz' }
  const sender = {}
  const sendResponse = jest.fn()

  messages.stream.subscribe((tuple) => {
    expect(tuple).toBeInstanceOf(Array)
    expect(tuple.length).toBe(2)
    expect(tuple[0]).toBe(payload)
    expect(tuple[1]).toBe(sender)

    done()
  })

  const message: CoreMessage = {
    async: false,
    scope: scopeName,
    payload,
    tabId: null,
  }

  chrome.runtime.onMessage.callListeners(message, sender, sendResponse)
})
