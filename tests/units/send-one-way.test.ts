import { chrome } from '@bumble/jest-chrome'
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

test('calls tabs.sendMessage if target is number', () => {
  const message = { greeting: 'hello' }
  const tabId = 1234

  messages.send(message, { tabId })

  expect(chrome.tabs.sendMessage).toBeCalled()
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

// TODO: unskip once last error implemented
test.skip('rejects if runtime.lastError', async () => {
  expect.assertions(1)

  const message = { greeting: 'hello' }
  const errorMessage = 'should not resolve'
  // chrome.runtime.sendMessage.setLastError(errorMessage)

  const result = messages.send(message)

  try {
    await result
  } catch (error) {
    expect(error.message).toBe(errorMessage)
  }
})
