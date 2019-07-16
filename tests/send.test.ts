import { messages } from '../src/index'

import chrome from 'sinon-chrome'
import assert from 'power-assert'

let lastError: any
const lastErrorSpy = jest.fn(() => lastError)
Object.defineProperty(chrome.runtime, 'lastError', {
  get: lastErrorSpy,
})

afterEach(() => {
  lastError = undefined
  chrome.reset()
})

describe('messages.send', () => {
  test('creates general message if no target given', () => {
    const message = { greeting: 'hello' }

    messages.send(message)

    expect(
      chrome.runtime.sendMessage.firstCall.args[0],
    ).toMatchObject({ target: null })
  })

  test('calls runtime.sendMessage if no target', () => {
    const message = { greeting: 'hello' }

    messages.send(message)

    assert(
      chrome.runtime.sendMessage.called,
      'runtime.sendMessage was not called',
    )
  })

  test('creates targeted message if target given', () => {
    const message = { greeting: 'hello' }
    const target = 'background'

    messages.send(message, target)

    expect(
      chrome.runtime.sendMessage.firstCall.args[0],
    ).toMatchObject({ target })
  })

  test('calls runtime.sendMessage if target is string', () => {
    const message = { greeting: 'hello' }
    const target = 'background'

    messages.send(message, target)

    assert(chrome.runtime.sendMessage.called)
  })

  test('calls tabs.sendMessage if target is number', () => {
    const message = { greeting: 'hello' }
    const target = 1234

    messages.send(message, target)

    assert(chrome.tabs.sendMessage.called)
  })

  test('calls runtime.sendMessage with one-way coreMessage', () => {
    const message = { greeting: 'hello' }
    const target = 'background'

    const coreMessage = {
      async: false,
      target,
      payload: message,
    }

    messages.send(message, target)

    const { firstCall } = chrome.runtime.sendMessage

    expect(firstCall.args[0]).toEqual(coreMessage)
  })

  test('rejects if runtime.lastError', (done) => {
    const message = { greeting: 'hello' }
    const target = 'background'
    lastError = { message: 'should not resolve' }

    const result = messages.send(message, target)
    chrome.runtime.sendMessage.invokeCallback()

    result
      .then(() => {
        expect(lastErrorSpy).toBeCalled()
        done.fail(lastErrorSpy())
      })
      .catch((error) => {
        expect(lastErrorSpy).toBeCalled()
        expect(error.message).toBe(lastError.message)
        done()
      })
  })
})

describe('messages.sendAsync', () => {
  test.todo('creates async message')
  test.todo('creates general message if no target')
  test.todo('calls runtime.sendMessage if no target')
  test.todo('creates targeted message if target')
  test.todo('calls runtime.sendMessage if target is string')
  test.todo('calls tabs.sendMessage if target is number')
  test.todo('resolves with response')
  test.todo('rejects if runtime.lastError')
})
