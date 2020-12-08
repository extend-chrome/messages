import { chrome } from 'jest-chrome'
import { Observable } from 'rxjs'
import { _listeners } from '../../src/ListenerMap'
import { getScope } from '../../src/scope'
import { CoreMessage } from '../../src/types'

const scope = 'test scope'
const messages = getScope(scope)

const greeting = 'test line'
const wrappedMessage = messages.getMessage(greeting)
const [send, stream, waitFor] = wrappedMessage

afterEach(() => {
  _listeners.clear()
})

test('returns correct tuple', () => {
  expect(wrappedMessage).toBeInstanceOf(Array)
  expect(wrappedMessage.length).toBe(3)

  expect(send).toBeInstanceOf(Function)
  expect(send.length).toBe(2)
  
  expect(send.toTab).toBeInstanceOf(Function)
  expect(send.toTab.length).toBe(1)
  
  const sendResult = send('abc')
  
  expect(sendResult).toBeInstanceOf(Promise)

  expect(stream).toBeInstanceOf(Observable)

  expect(waitFor).toBeInstanceOf(Function)
  expect(waitFor()).toBeInstanceOf(Promise)
  expect(waitFor(() => true)).toBeInstanceOf(Promise)
})

test('sends correct message', () => {
  const data = 'data'

  send(data)

  expect(chrome.runtime.sendMessage).toBeCalledWith(
    expect.objectContaining({
      async: false,
      payload: {
        greeting,
        data,
      },
    }),
    expect.any(Function)
  )
})

test('subscribes to onMessage event', () => {
  expect(_listeners.size).toBe(0)
  stream.subscribe()
  expect(_listeners.size).toBe(1)

  const listeners = _listeners.get(scope)
  if (listeners) {
    expect(listeners.size).toBe(2)
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
    tabId: null,
    payload: {
      greeting,
      data,
    },
  }
  const sender = {}
  const respond = jest.fn()

  stream.subscribe((tuple) => {
    expect(tuple).toBeInstanceOf(Array)
    expect(tuple.length).toBe(2)

    const [_data, _sender] = tuple

    expect(_data).toBe(data)
    expect(_sender).toBe(sender)

    done()
  })

  chrome.runtime.onMessage.callListeners(message, sender, respond)
})

test('ignores wrong message', (done) => {
  expect.assertions(0)

  const data = { abc: 'xyz' }
  const message: CoreMessage = {
    async: false,
    scope: scope,
    tabId: null,
    payload: {
      greeting: 'other',
      data,
    },
  }
  const sender = {}
  const respond = jest.fn()

  stream.subscribe(() => {
    done.fail()
  })

  chrome.runtime.onMessage.callListeners(message, sender, respond)

  setTimeout(() => {
    done()
  }, 1500)
})

test('ignores primitive message', (done) => {
  expect.assertions(0)

  const message: CoreMessage = {
    async: false,
    scope: scope,
    tabId: null,
    payload: 15,
  }
  const sender = {}
  const respond = jest.fn()

  stream.subscribe(() => {
    done.fail()
  })

  chrome.runtime.onMessage.callListeners(message, sender, respond)

  setTimeout(() => {
    done()
  }, 1500)
})

test('ignores null message', (done) => {
  expect.assertions(0)

  const message: CoreMessage = {
    async: false,
    scope: scope,
    tabId: null,
    payload: null,
  }
  const sender = {}
  const respond = jest.fn()

  stream.subscribe(() => {
    done.fail()
  })

  chrome.runtime.onMessage.callListeners(message, sender, respond)

  setTimeout(() => {
    done()
  }, 1500)
})

test('ignores undefined message', (done) => {
  expect.assertions(0)

  const message: CoreMessage = {
    async: false,
    scope: scope,
    tabId: null,
    payload: undefined,
  }
  const sender = {}
  const respond = jest.fn()

  stream.subscribe(() => {
    done.fail()
  })

  chrome.runtime.onMessage.callListeners(message, sender, respond)

  setTimeout(() => {
    done()
  }, 1500)
})
