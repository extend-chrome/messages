import { useScope } from '../../src/scope'

import { _listeners, _getListener } from '../../src/ListenerMap'

import * as chrome from 'sinon-chrome'
import { CoreMessage } from '../../src/types'

const scopeName = 'test scope'
const messages = useScope(scopeName)

afterEach(() => {
  chrome.reset()
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
  const sender = { id: 123 }

  messages.stream.subscribe((tuple) => {
    expect(tuple).toBeInstanceOf(Array)
    expect(tuple.length).toBe(2)

    const [_payload, _sender] = tuple

    expect(_payload).toBe(payload)
    expect(_sender).toBe(sender)

    done()
  })

  const message: CoreMessage = {
    async: false,
    scope: scopeName,
    target: null,
    payload,
  }

  chrome.runtime.onMessage.trigger(message, sender)
})
