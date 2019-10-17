import { Observable } from 'rxjs'
import * as chrome from 'sinon-chrome'
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
    async: true,
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
  expect.assertions(7)

  const data = { abc: 'xyz' }
  const message: CoreMessage = {
    async: true,
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

  chrome.runtime.onMessage.trigger(message, sender, respond)
})

test('ignores wrong message', (done) => {
  expect.assertions(0)

  const data = { abc: 'xyz' }
  const sender = { id: 123 }
  const message: CoreMessage = {
    async: false,
    scope: scope,
    target: null,
    payload: {
      greeting: 'other',
      data,
    },
  }

  stream.subscribe(() => {
    done.fail()
  })

  chrome.runtime.onMessage.trigger(message, sender)

  setTimeout(() => {
    done()
  }, 500)
})

test('ignores primitive message', (done) => {
  expect.assertions(0)

  const sender = { id: 123 }
  const message: CoreMessage = {
    async: false,
    scope: scope,
    target: null,
    payload: 123,
  }

  stream.subscribe(() => {
    done.fail()
  })

  chrome.runtime.onMessage.trigger(message, sender)

  setTimeout(() => {
    done()
  }, 500)
})

test('ignores null message', (done) => {
  expect.assertions(0)

  const sender = { id: 123 }
  const message: CoreMessage = {
    async: false,
    scope: scope,
    target: null,
    payload: null,
  }

  stream.subscribe(() => {
    done.fail()
  })

  chrome.runtime.onMessage.trigger(message, sender)

  setTimeout(() => {
    done()
  }, 500)
})

test('ignores undefined message', (done) => {
  expect.assertions(0)

  const sender = { id: 123 }
  const message: CoreMessage = {
    async: false,
    scope: scope,
    target: null,
    payload: undefined,
  }

  stream.subscribe(() => {
    done.fail()
  })

  chrome.runtime.onMessage.trigger(message, sender)

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
    target: null,
    payload: {
      greeting,
      data,
    },
  }
  const sender = { id: 123 }
  const respond = jest.fn()

  stream.subscribe(([d, s, _respond]) => {
    expect(respond).not.toBeCalled()

    _respond(5)

    expect(respond).toBeCalled()

    done()
  })

  chrome.runtime.onMessage.trigger(message, sender, respond)
})
