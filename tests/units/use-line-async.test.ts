import { chrome } from '@bumble/jest-chrome'
import { Observable, Subscription } from 'rxjs'
import { _listeners } from '../../src/ListenerMap'
import { useScope } from '../../src/scope'
import { CoreMessage } from '../../src/types'

const scope = 'test scope'
const messages = useScope(scope)

const greeting = 'test line'
const line = messages.useLine<string, number>(greeting, {
  async: true,
})
const [send, stream] = line

let subscription: Subscription | undefined

afterEach(() => {
  _listeners.clear()
  jest.clearAllMocks()

  subscription && subscription.unsubscribe()
  subscription = undefined
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

  expect(chrome.runtime.sendMessage).toBeCalledWith(
    expect.objectContaining({
      async: true,
      payload: {
        greeting,
        data,
      },
    }),
    expect.any(Function),
  )
})

test('subscribes to onMessage event', () => {
  expect(_listeners.size).toBe(0)
  subscription = stream.subscribe()
  expect(_listeners.size).toBe(1)

  const listeners = _listeners.get(scope)
  if (listeners) {
    expect(listeners.size).toBe(2)
  } else {
    expect(listeners).toBeDefined()
  }
})

test('emits correct message', (done) => {
  expect.assertions(7)

  const data = { abc: 'xyz' }
  const message: CoreMessage = {
    async: true,
    scope: scope,
    tabId: null,
    payload: {
      greeting,
      data,
    },
  }
  const sender = {}
  const respond = jest.fn()

  subscription = stream.subscribe((tuple) => {
    expect(tuple).toBeInstanceOf(Array)
    expect(tuple.length).toBe(3)

    const [_data, _sender, _respond] = tuple

    expect(_data).toBe(data)
    expect(_sender).toBe(sender)
    expect(_respond).toBeInstanceOf(Function)

    expect(respond).not.toBeCalled()
    _respond(5)
    expect(respond).toBeCalled()

    done()
  })

  chrome.runtime.onMessage.callListeners(message, sender, respond)
})

test('ignores message for other scope', (done) => {
  expect.assertions(0)

  const data = { abc: 'xyz' }
  const message: CoreMessage = {
    async: false,
    scope: 'other scope',
    tabId: null,
    payload: {
      greeting: 'other',
      data,
    },
  }
  const sender = {}
  const sendResponse = jest.fn()

  subscription = stream.subscribe(() => {
    done.fail()
  })

  chrome.runtime.onMessage.callListeners(message, sender, sendResponse)

  setTimeout(() => {
    done()
  }, 500)
})

test('ignores primitive message', (done) => {
  expect.assertions(0)

  const message: CoreMessage = {
    async: false,
    scope: scope,
    tabId: null,
    payload: 123,
  }
  const sender = {}
  const sendResponse = jest.fn()

  subscription = stream.subscribe(() => {
    done.fail()
  })

  chrome.runtime.onMessage.callListeners(message, sender, sendResponse)

  setTimeout(() => {
    done()
  }, 500)
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
  const sendResponse = jest.fn()

  subscription = stream.subscribe(() => {
    done.fail()
  })

  chrome.runtime.onMessage.callListeners(message, sender, sendResponse)

  setTimeout(() => {
    done()
  }, 500)
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
  const sendMessage = jest.fn()

  subscription = stream.subscribe(() => {
    done.fail()
  })

  chrome.runtime.onMessage.callListeners(message, sender, sendMessage)

  setTimeout(() => {
    done()
  }, 500)
})

test('respond function calls native respond', (done) => {
  expect.assertions(2)

  const data = { abc: 'xyz' }
  const message: CoreMessage = {
    async: true,
    scope: scope,
    tabId: null,
    payload: {
      greeting,
      data,
    },
  }
  const sender = {}
  const respond = jest.fn()

  subscription = stream.subscribe(([, , _respond]) => {
    expect(respond).not.toBeCalled()

    _respond(5)

    expect(respond).toBeCalled()

    done()
  })

  chrome.runtime.onMessage.callListeners(message, sender, respond)
})
