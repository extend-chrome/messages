import { Observable } from 'rxjs'
import * as chrome from 'sinon-chrome'
import { _listeners } from '../../src/ListenerMap'
import { useScope } from '../../src/scope'
import { CoreMessage } from '../../src/types'

const scope = 'test scope'
const messages = useScope(scope)

const greeting = 'test line'
const line = messages.useLine(greeting)
const [send, stream] = line

afterEach(() => {
  chrome.reset()
  _listeners.clear()
})

test('returns correct tuple', () => {
  expect(line).toBeInstanceOf(Array)
  expect(line.length).toBe(2)

  const [send, stream] = line

  expect(stream).toBeInstanceOf(Observable)

  expect(send).toBeInstanceOf(Function)
  expect(send.length).toBe(2)

  const sendResult = send('abc')

  expect(sendResult).toBeInstanceOf(Promise)
})

test('sends correct message', () => {
  const data = 'data'

  send(data)

  expect(
    chrome.runtime.sendMessage.firstCall.args[0],
  ).toMatchObject({
    async: false,
    payload: {
      greeting,
      data,
    },
  })
})

test('subscribes to onMessage event', () => {
  expect(_listeners.size).toBe(0)
  stream.subscribe()
  expect(_listeners.size).toBe(1)

  const listeners = _listeners.get(scope)
  if (listeners) {
    expect(listeners.size).toBe(2)
    expect(chrome.runtime.onMessage.addListener.called).toBe(
      true,
    )
  } else {
    expect(listeners).toBeDefined()
  }
})

test('emits correct message', (done) => {
  expect.assertions(4)

  const data = { abc: 'xyz' }
  const message: CoreMessage = {
    async: false,
    scope: scope,
    target: null,
    payload: {
      greeting,
      data,
    },
  }
  const sender = { id: 123 }
  const respond = jest.fn()

  stream.subscribe((tuple) => {
    expect(tuple).toBeInstanceOf(Array)
    expect(tuple.length).toBe(2)

    const [_data, _sender] = tuple

    expect(_data).toBe(data)
    expect(_sender).toBe(sender)

    done()
  })

  chrome.runtime.onMessage.trigger(message, sender, respond)
})

test('ignores wrong message', (done) => {
  expect.assertions(0)

  const data = { abc: 'xyz' }
  const message: CoreMessage = {
    async: false,
    scope: scope,
    target: null,
    payload: {
      greeting: 'other',
      data,
    },
  }
  const sender = { id: 123 }
  const respond = jest.fn()

  stream.subscribe(() => {
    done.fail()
  })

  chrome.runtime.onMessage.trigger(message, sender, respond)

  setTimeout(() => {
    done()
  }, 1500)
})
