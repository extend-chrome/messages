import { chrome } from 'jest-chrome'
import { ChromeMessageError } from '../../src/ChromeMessageError'
import { getScope } from '../../src/scope'
import { CoreMessage, CoreResponse } from '../../src/types'

const scope = 'test'
const messages = getScope(scope)

let lastErrorMessage: string
const lastErrorSpy = jest.fn(() => lastErrorMessage)
const lastError = {
  get message() {
    return lastErrorSpy()
  },
}

afterEach(jest.clearAllMocks)

test('sends async CoreMessage to runtime', () => {
  const payload = { greeting: 'hello' }
  const coreMessage: CoreMessage = {
    async: true,
    payload,
    scope,
    tabId: null,
  }

  messages.send(payload, { async: true })

  expect(chrome.runtime.sendMessage).toBeCalledWith(
    coreMessage,
    expect.any(Function),
  )
})

test('sends async CoreMessage to tab', () => {
  const payload = { greeting: 'hello' }
  const tabId = 1234

  const coreMessage: CoreMessage = {
    async: true,
    payload,
    scope,
    tabId,
  }

  messages.send(payload, { tabId, async: true })

  expect(chrome.tabs.sendMessage).toBeCalledWith(
    tabId,
    coreMessage,
    expect.any(Function),
  )
})

test('sends async CoreMessage to frame', () => {
  const payload = { greeting: 'hello' }
  const tabId = 1234
  const frameId = 5678

  const coreMessage: CoreMessage = {
    async: true,
    payload,
    scope,
    tabId,
  }

  messages.send(payload, { tabId, frameId, async: true })

  expect(chrome.tabs.sendMessage).toBeCalledWith(
    tabId,
    coreMessage,
    { frameId },
    expect.any(Function),
  )

  expect(chrome.runtime.sendMessage).not.toBeCalled()
})

test('resolves with response', async () => {
  const message = { greeting: 'hello' }

  const response = { greeting: 'goodbye' }
  const coreResponse: CoreResponse = {
    payload: response,
    success: true,
  }

  chrome.runtime.sendMessage.mockImplementation(
    (m: any, sendResponse?: (respond: any) => void) => {
      sendResponse?.(coreResponse)
    },
  )

  const result = await messages.send(message, { async: true })

  expect(result).toEqual(response)
})

test('rejects if success === false', async () => {
  expect.assertions(4)

  const message = { greeting: 'hello' }
  const response = {
    greeting: 'should not resolve',
  }
  const coreResponse: CoreResponse = {
    payload: { greeting: 'should not resolve' },
    success: false,
  }

  chrome.runtime.sendMessage.mockImplementation(
    (m: any, sendResponse?: (respond: any) => void) => {
      sendResponse?.(coreResponse)
    },
  )

  try {
    await messages.send(message, { async: true })
  } catch (error) {
    expect(error).toBeInstanceOf(ChromeMessageError)
    expect(error.message).toBe(response.greeting)
    expect(error.coreResponse).toBe(coreResponse)
    expect(error.coreMessage).toMatchObject({
      async: true,
      payload: message,
      scope,
    })
  }
})

test('rejects if runtime.lastError', async () => {
  expect.assertions(3)

  const message = { greeting: 'hello' }
  lastErrorMessage = 'should reject'
  chrome.runtime.lastError = lastError

  try {
    await messages.send(message, { async: true })
  } catch (error) {
    expect(lastErrorSpy).toBeCalled()
    expect(error).toBeInstanceOf(ChromeMessageError)
    expect(error.message).toBe(lastErrorMessage)
  }
})
