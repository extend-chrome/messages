import { useScope } from '../../src/scope'

import * as chrome from 'sinon-chrome'
import assert from 'power-assert'
import {
  TargetName,
  CoreMessage,
  CoreResponse,
} from '../../src/types'

const scope = 'test'
const messages = useScope(scope)

let lastError: { message: string } | undefined
const lastErrorSpy = jest.fn(() => lastError)
Object.defineProperty(chrome.runtime, 'lastError', {
  get: lastErrorSpy,
})

afterEach(() => {
  lastError = undefined
  chrome.reset()
})

test('creates async message', () => {
  const message = { greeting: 'hello' }

  messages.send(message, { async: true })

  expect(
    chrome.runtime.sendMessage.firstCall.args[0],
  ).toMatchObject({ async: true })
})

test('creates general message if no target', () => {
  const message = { greeting: 'hello' }

  messages.send(message, { async: true })

  expect(
    chrome.runtime.sendMessage.firstCall.args[0],
  ).toMatchObject({ target: null })
})

test('calls runtime.sendMessage if no target', () => {
  const message = { greeting: 'hello' }

  messages.send(message, { async: true })

  assert(
    chrome.runtime.sendMessage.called,
    'runtime.sendMessage was not called',
  )
})

test('creates targeted message if target', () => {
  const message = { greeting: 'hello' }
  const target: TargetName = 'background'

  messages.send(message, { target, async: true })

  expect(
    chrome.runtime.sendMessage.firstCall.args[0],
  ).toMatchObject({ target })
})

test('calls runtime.sendMessage if target is string', () => {
  const message = { greeting: 'hello' }
  const target: TargetName = 'background'

  messages.send(message, { target, async: true })

  assert(
    chrome.runtime.sendMessage.called,
    'runtime.sendMessage was not called',
  )
})

test('calls tabs.sendMessage if target is number', () => {
  const message = { greeting: 'hello' }
  const target: TargetName = 1234

  messages.send(message, { target, async: true })

  assert(
    chrome.tabs.sendMessage.called,
    'tabs.sendMessage was not called',
  )
})

test('creates async coreMessage', () => {
  const message = { greeting: 'hello' }
  const target: TargetName = 'background'

  const coreMessage: CoreMessage = {
    async: true,
    target,
    payload: message,
    scope,
  }

  messages.send(message, { target, async: true })

  const { firstCall } = chrome.runtime.sendMessage
  const [result] = firstCall.args

  expect(result.async).toBe(true)
  expect(result).toEqual(coreMessage)
})

test('creates scoped coreMessage', () => {
  const message = { greeting: 'hello' }
  const target: TargetName = 'background'

  const coreMessage: CoreMessage = {
    async: true,
    target,
    payload: message,
    scope,
  }

  messages.send(message, { target, async: true })

  const { firstCall } = chrome.runtime.sendMessage
  const [result] = firstCall.args

  expect(result.scope).toBe(scope)
  expect(result).toEqual(coreMessage)
})

test('resolves with response', async () => {
  const message = { greeting: 'hello' }
  const target: TargetName = 'background'

  const response = { greeting: 'goodbye' }
  const coreResponse: CoreResponse = {
    payload: response,
    success: true,
  }

  const promise = messages.send(message, { target, async: true })
  chrome.runtime.sendMessage.invokeCallback(coreResponse)

  const result = await promise

  expect(result).toEqual(response)
})

test('rejects if success === false', async () => {
  expect.assertions(2)

  const message = { greeting: 'hello' }
  const target: TargetName = 'background'

  const response = {
    greeting: 'should not resolve',
  }
  const coreResponse: CoreResponse = {
    payload: { greeting: 'should not resolve' },
    success: false,
  }

  const promise = messages.send(message, { target, async: true })
  chrome.runtime.sendMessage.invokeCallback(coreResponse)

  try {
    await promise
  } catch (error) {
    expect(error).toBeInstanceOf(Error)
    expect(error.message).toBe(response.greeting)
  }
})

test('rejects if runtime.lastError', async () => {
  expect.assertions(2)

  const message = { greeting: 'hello' }
  const target: TargetName = 'background'
  lastError = { message: 'should not resolve' }

  const result = messages.send(message, { target, async: true })
  chrome.runtime.sendMessage.invokeCallback()

  try {
    await result
  } catch (error) {
    expect(lastErrorSpy).toBeCalled()
    expect(error.message).toBe(lastError.message)
  }
})
