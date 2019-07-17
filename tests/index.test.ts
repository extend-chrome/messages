import { onMessage, sendMessage } from '../src/index'
import { asyncOn, on, _listeners, off } from '../src/events'
import { asyncSend, send } from '../src/send'

jest.mock('../src/events', () => {
  const _size = jest.fn(() => 123)

  return {
    asyncOn: jest.fn(),
    on: jest.fn(),
    off: jest.fn(),
    _listeners: {
      has: jest.fn(),
      get size() {
        return _size()
      },
      _size,
    },
  }
})
jest.mock('../src/send')

describe('onMessage', () => {
  test('async addListener', () => {
    onMessage.addListener(() => {}, { async: true })

    expect(asyncOn).toBeCalled()
  })

  test('one-way addListener', () => {
    onMessage.addListener(() => {})

    expect(on).toBeCalled()
  })

  test('removeListener', () => {
    const listener = () => {}
    onMessage.removeListener(listener)

    expect(off).toBeCalled()
  })

  test('hasListeners', () => {
    onMessage.hasListeners()

    // @ts-ignore
    expect(_listeners._size).toBeCalled()
  })

  test('hasListeners', () => {
    const listener = () => {}
    onMessage.hasListener(listener)

    expect(_listeners.has).toBeCalled()
  })
})

describe('sendMessage', () => {
  const message = {
    greeting: 'hello',
  }

  test('async sendMessage', () => {
    sendMessage(message, { async: true })

    expect(asyncSend).toBeCalled()
  })

  test('one-way sendMessage', () => {
    sendMessage(message, { async: false })

    expect(send).toBeCalled()
  })
})
