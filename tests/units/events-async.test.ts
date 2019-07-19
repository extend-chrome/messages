import { messages } from '../../src/index'
import { _listeners } from '../../src/events'

import chrome from 'sinon-chrome'
import assert from 'power-assert'
import delay from 'delay'

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
  async: true,
  target: null,
  payload: message,
}
const sender = {} // Not used directly by @bumble/messages
const response: MessagePayload = {
  greeting: 'goodbye',
}

const listener: AsyncMessageListener = (
  message,
  sender,
  sendResponse,
) => {
  // @ts-ignore
  sendResponse(response)
}
const listenerSpy = jest.fn(listener)
const sendResponse = jest.fn()

const triggerOnMessage = () => {
  chrome.runtime.onMessage.trigger(
    coreMessage,
    sender,
    sendResponse,
  )
}

test('listens to runtime.onMessage', () => {
  messages.asyncOn(listenerSpy)
  assert(chrome.runtime.onMessage.addListener.called)
  expect(listenerSpy).not.toBeCalled()

  triggerOnMessage()
  expect(listenerSpy).toBeCalled()
})

test('adds listener to _listeners Map', () => {
  messages.asyncOn(listenerSpy)

  expect(_listeners.has(listenerSpy)).toBe(true)
})

test('internal listener returns true', () => {
  messages.asyncOn(listenerSpy)

  const _listener = _listeners.get(listenerSpy)

  expect(_listener).toBeDefined()
  expect(_listener).toBeInstanceOf(Function)
  // @ts-ignore
  expect(_listener(coreMessage, sender, sendResponse)).toBe(true)
})

test('listener receives CoreMessage payload', () => {
  messages.asyncOn(listenerSpy)
  triggerOnMessage()

  expect(listenerSpy).toBeCalledWith(
    message,
    sender,
    expect.any(Function),
  )
})

describe('sendResponse', () => {
  test('respond calls sendResponse from runtime.onMessage', () => {
    messages.asyncOn(listenerSpy)
    chrome.runtime.onMessage.trigger(
      coreMessage,
      sender,
      sendResponse,
    )

    expect(sendResponse).toBeCalled()
  })

  test('respond calls sendResponse with a CoreResponse', () => {
    messages.asyncOn(listenerSpy)
    chrome.runtime.onMessage.trigger(
      coreMessage,
      sender,
      sendResponse,
    )

    const expectedResponse: CoreResponse = {
      payload: response,
      success: true,
    }

    expect(sendResponse).toBeCalledWith(expectedResponse)
  })

  test('calls sendResponse with error if callback throws', () => {
    const message = 'something went wrong'
    const listenerSpy = jest.fn(() => {
      throw new Error(message)
    })

    const response: CoreResponse = {
      success: false,
      payload: { greeting: message },
    }

    messages.asyncOn(listenerSpy)
    chrome.runtime.onMessage.trigger(
      coreMessage,
      sender,
      sendResponse,
    )

    expect(console.error).toBeCalled()
    expect(sendResponse).toBeCalledWith(response)
  })

  test('calls sendResponse with error if callback rejects', async () => {
    const message = 'something went wrong'
    const listenerSpy = jest.fn(() =>
      Promise.reject(new Error(message)),
    )

    const response: CoreResponse = {
      success: false,
      payload: { greeting: message },
    }

    messages.asyncOn(listenerSpy)
    chrome.runtime.onMessage.trigger(
      coreMessage,
      sender,
      sendResponse,
    )

    await delay(100)

    expect(console.error).toBeCalled()
    expect(sendResponse).toBeCalledWith(response)
  })
})

describe('message filtering', () => {
  test('receives async messages', () => {
    const listener = jest.fn()

    messages.asyncOn(listener)
    chrome.runtime.onMessage.trigger(coreMessage, sender)

    expect(listener).toBeCalled()
  })

  test('ignores one-way messages', () => {
    const oneWayMessage: CoreMessage = {
      async: false,
      payload: message,
      target: null,
    }

    const listener = jest.fn()

    messages.asyncOn(listener)
    chrome.runtime.onMessage.trigger(oneWayMessage, sender)

    expect(listener).not.toBeCalled()
  })

  test('receives messages for own target name', () => {
    const target = 'background'
    const coreMessage: CoreMessage = {
      async: true,
      payload: message,
      target: target,
    }

    const listener = jest.fn()

    messages.asyncOn(listener, target)
    chrome.runtime.onMessage.trigger(coreMessage, sender)

    expect(listener).toBeCalled()
  })

  test('ignores messages for other targets', () => {
    const target = 'background'
    const coreMessage: CoreMessage = {
      async: true,
      payload: message,
      target: 'options',
    }

    const listener = jest.fn()

    messages.asyncOn(listener, target)
    chrome.runtime.onMessage.trigger(coreMessage, sender)

    expect(listener).not.toBeCalled()
  })

  test('receives general messages if no target name', () => {
    const coreMessage: CoreMessage = {
      async: true,
      payload: message,
      target: null,
    }

    const listener = jest.fn()

    messages.asyncOn(listener)
    chrome.runtime.onMessage.trigger(coreMessage, sender)

    expect(listener).toBeCalled()
  })

  test('ignores targeted messages if no target name', () => {
    const coreMessage: CoreMessage = {
      async: true,
      payload: message,
      target: 'options',
    }

    const listener = jest.fn()

    messages.asyncOn(listener)
    chrome.runtime.onMessage.trigger(coreMessage, sender)

    expect(listener).not.toBeCalled()
  })
})
