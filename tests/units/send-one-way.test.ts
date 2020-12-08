import { chrome } from 'jest-chrome'
import { ChromeMessageError } from '../../src/ChromeMessageError'
import { getScope } from '../../src/scope'
import { CoreMessage } from '../../src/types'

const scope = 'test'
const messages = getScope(scope)

afterEach(jest.clearAllMocks)

test('creates one-way message', () => {
  const message = { greeting: 'hello' }

  messages.send(message)

  expect(chrome.runtime.sendMessage).toBeCalledWith(
    expect.objectContaining({
      async: false,
    }),
    expect.any(Function),
  )
})

test('creates general message if no target given', () => {
  const message = { greeting: 'hello' }

  messages.send(message)

  expect(chrome.runtime.sendMessage).toBeCalledWith(
    expect.objectContaining({
      tabId: null,
    }),
    expect.any(Function),
  )
})

test('calls runtime.sendMessage if no target', () => {
  const message = { greeting: 'hello' }

  messages.send(message)

  expect(chrome.runtime.sendMessage).toBeCalled()
  expect(chrome.tabs.sendMessage).not.toBeCalled()
})

test('calls tabs.sendMessage if tabId is given', () => {
  const message = { greeting: 'hello' }
  const tabId = 1234

  messages.send(message, { tabId })

  expect(chrome.tabs.sendMessage).toBeCalled()
  expect(chrome.runtime.sendMessage).not.toBeCalled()
})

test('calls tabs.sendMessage with frameId if frameId is given', () => {
  const payload = { greeting: 'hello' }
  const tabId = 1234
  const frameId = 5678

  const coreMessage: CoreMessage = {
    async: false,
    tabId,
    payload,
    scope,
  }

  messages.send(payload, { tabId, frameId })

  expect(chrome.tabs.sendMessage).toBeCalledWith(
    tabId,
    coreMessage,
    { frameId },
    expect.any(Function),
  )

  expect(chrome.runtime.sendMessage).not.toBeCalled()
})

test('creates one-way coreMessage', () => {
  const message = { greeting: 'hello' }

  const coreMessage: CoreMessage = {
    async: false,
    tabId: null,
    payload: message,
    scope,
  }

  messages.send(message)

  expect(chrome.runtime.sendMessage).toBeCalledWith(
    coreMessage,
    expect.any(Function),
  )
})

test('rejects if runtime.lastError', async () => {
  expect.assertions(2)

  const message = { greeting: 'hello' }
  const lastError = { message: 'should not resolve' }
  chrome.runtime.lastError = lastError

  chrome.runtime.sendMessage.mockImplementation(
    (m: any, sendResponse?: (respond: any) => void) => {
      sendResponse?.({})
    },
  )

  try {
    await messages.send(message)
  } catch (error) {
    expect(error).toBeInstanceOf(ChromeMessageError)
    expect(error.message).toBe(lastError.message)
  }
})
