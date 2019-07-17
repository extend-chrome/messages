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

describe('messages.on', () => {
  const message: MessagePayload = {
    greeting: 'hello',
  }
  const coreMessage: CoreMessage = {
    async: false,
    target: null,
    payload: message,
  }
  const sender = {} // Not used directly by @bumble/messages

  describe('basic', () => {
    test('listens to runtime.onMessage', () => {
      const listener = jest.fn()

      messages.on(listener)

      assert(chrome.runtime.onMessage.addListener.called)
      expect(listener).not.toBeCalled()

      chrome.runtime.onMessage.trigger(coreMessage)

      expect(listener).toBeCalled()
    })

    test('internal listener returns false', () => {
      const listener = jest.fn()

      messages.on(listener)

      const _listener = _listeners.get(listener)

      expect(_listener).toBeInstanceOf(Function)
      // @ts-ignore
      expect(_listener(coreMessage, sender)).toBe(false)
    })

    test('listener receives CoreMessage payload', () => {
      const listener = jest.fn()

      messages.on(listener)
      chrome.runtime.onMessage.trigger(coreMessage, sender)

      expect(listener).toBeCalledWith(message, sender)
    })

    test('adds listener to _listeners Map', () => {
      const listener = jest.fn()

      messages.on(listener)

      expect(_listeners.has(listener)).toBe(true)
    })
  })

  describe('message filtering', () => {
    test('receives one-way messages', () => {
      const listener = jest.fn()

      messages.on(listener)
      chrome.runtime.onMessage.trigger(coreMessage, sender)

      expect(listener).toBeCalled()
    })

    test('ignores async messages', () => {
      const asyncMessage: CoreMessage = {
        async: true,
        payload: message,
        target: null,
      }

      const listener = jest.fn()

      messages.on(listener)
      chrome.runtime.onMessage.trigger(asyncMessage, sender)

      expect(listener).not.toBeCalled()
    })

    test('receives messages for own target name', () => {
      const target = 'background'
      const coreMessage: CoreMessage = {
        async: false,
        payload: message,
        target: target,
      }

      const listener = jest.fn()

      messages.on(listener, target)
      chrome.runtime.onMessage.trigger(coreMessage, sender)

      expect(listener).toBeCalled()
    })

    test('ignores messages for other targets', () => {
      const target = 'background'
      const coreMessage: CoreMessage = {
        async: false,
        payload: message,
        target: 'options',
      }

      const listener = jest.fn()

      messages.on(listener, target)
      chrome.runtime.onMessage.trigger(coreMessage, sender)

      expect(listener).not.toBeCalled()
    })

    test('receives general messages if no target', () => {
      const coreMessage: CoreMessage = {
        async: false,
        payload: message,
        target: null,
      }

      const listener = jest.fn()

      messages.on(listener)
      chrome.runtime.onMessage.trigger(coreMessage, sender)

      expect(listener).toBeCalled()
    })

    test('ignores targeted messages if no target', () => {
      const coreMessage: CoreMessage = {
        async: false,
        payload: message,
        target: 'options',
      }

      const listener = jest.fn()

      messages.on(listener)
      chrome.runtime.onMessage.trigger(coreMessage, sender)

      expect(listener).not.toBeCalled()
    })
  })
})

describe('messages.asyncOn', () => {
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

  describe('basic', () => {
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
      expect(_listener(coreMessage, sender, sendResponse)).toBe(
        true,
      )
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
})

describe('messages.off', () => {
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
})
