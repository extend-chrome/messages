import { messages } from '../../src/index'

import chrome from 'sinon-chrome'
import assert from 'power-assert'

let lastError: { message: string } | undefined
const lastErrorSpy = jest.fn(() => lastError)
Object.defineProperty(chrome.runtime, 'lastError', {
  get: lastErrorSpy,
})

afterEach(() => {
  lastError = undefined
  chrome.reset()
})

test('creates one-way message', () => {
  const message: MessagePayload = { greeting: 'hello' }

  messages.send(message)

  expect(
    chrome.runtime.sendMessage.firstCall.args[0],
  ).toMatchObject({ async: false })
})

test('creates general message if no target given', () => {
  const message: MessagePayload = { greeting: 'hello' }

  messages.send(message)

  expect(
    chrome.runtime.sendMessage.firstCall.args[0],
  ).toMatchObject({ target: null })
})

test('calls runtime.sendMessage if no target', () => {
  const message: MessagePayload = { greeting: 'hello' }

  messages.send(message)

  assert(
    chrome.runtime.sendMessage.called,
    'runtime.sendMessage was not called',
  )
})

test('creates targeted message if target given', () => {
  const message: MessagePayload = { greeting: 'hello' }
  const target: TargetName = 'background'

  messages.send(message, target)

  expect(
    chrome.runtime.sendMessage.firstCall.args[0],
  ).toMatchObject({ target })
})

test('calls runtime.sendMessage if target is string', () => {
  const message: MessagePayload = { greeting: 'hello' }
  const target: TargetName = 'background'

  messages.send(message, target)

  assert(
    chrome.runtime.sendMessage.called,
    'runtime.sendMessage was not called',
  )
})

test('calls tabs.sendMessage if target is number', () => {
  const message: MessagePayload = { greeting: 'hello' }
  const target: TargetName = 1234

  messages.send(message, target)

  assert(
    chrome.tabs.sendMessage.called,
    'tabs.sendMessage was not called',
  )
})

test('creates one-way coreMessage', () => {
  const message: MessagePayload = { greeting: 'hello' }
  const target: TargetName = 'background'

  const coreMessage: CoreMessage = {
    async: false,
    target,
    payload: message,
  }

  messages.send(message, target)

  const { firstCall } = chrome.runtime.sendMessage

  expect(firstCall.args[0]).toEqual(coreMessage)
})

test('rejects if runtime.lastError', async () => {
  expect.assertions(2)

  const message: MessagePayload = { greeting: 'hello' }
  const target: TargetName = 'background'
  lastError = { message: 'should not resolve' }

  const result = messages.send(message, target)
  chrome.runtime.sendMessage.invokeCallback()

  try {
    await result
  } catch (error) {
    expect(lastErrorSpy).toBeCalled()
    expect(error.message).toBe(lastError.message)
  }
})
