import { ports } from '../src/ports'
import { send, onlySend } from '../src/send'
import { Port } from './jest.setup'

jest.mock('../src/frames')
jest.setTimeout(500)

beforeEach(() => {
  ports.clear()

  // @ts-ignore
  chrome.runtime.connect.returns(Port(''))
})

describe('send', () => {
  test('sends message to target', async () => {
    const name1 = 'background'
    const port1 = Port(name1)
    ports.set(name1, port1)

    const name2 = 'options'
    const port2 = Port(name2)
    ports.set(name2, port2)

    const message: CoreMessage = {
      id: 'asdf12334',
      target: 'options',
      payload: {
        greeting: 'set-options',
      },
    }
    await send(message.payload, message.target)

    expect(port1.postMessage).not.toBeCalled()
    expect(port2.postMessage).toBeCalled()
  })

  test('resolves on matching response id', async () => {
    expect.assertions(1)

    const name1 = 'background'
    const port1 = Port(name1)
    ports.set(name1, port1)

    let once = 0
    port1.onMessage.addListener(({ id }) => {
      if (once === 0) {
        once++

        const response: CoreResponse = {
          id,
          payload: 'hey yourself',
          success: true,
          target: name1,
        }
        port1.postMessage(response)
      }
    })

    const payload = 'hey there'
    const result = await send(payload, name1)

    expect(result).toBe('hey yourself')
  })

  test('does not resolve on other response', async () => {
    expect.assertions(1)

    const name1 = 'background'
    const port1 = Port(name1)
    ports.set(name1, port1)

    let once = 0
    port1.onMessage.addListener(({ id }) => {
      if (once === 0) {
        once++

        const response1: CoreResponse = {
          id: 'abc123',
          payload: 'other',
          success: true,
          target: name1,
        }
        port1.postMessage(response1)

        const response2: CoreResponse = {
          id,
          payload: 'hey yourself',
          success: true,
          target: name1,
        }
        port1.postMessage(response2)
      }
    })

    const payload = 'hey there'
    const result = await send(payload, name1)

    expect(result).toBe('hey yourself')
  })

  test('rejects on failure', () => {
    const name1 = 'background'
    const port1 = Port(name1)
    ports.set(name1, port1)

    let once = 0
    // @ts-ignore
    port1.postMessage.mockImplementationOnce(({ id }) => {
      if (once === 0) {
        once++

        const response2: CoreResponse = {
          id,
          payload: 'some error',
          success: false,
          target: name1,
        }
        port1.postMessage(response2)
      }
    })

    const payload = 'hey there'

    return expect(send(payload, name1)).rejects.toBe(
      'some error',
    )
  })
})

describe('onlySend', () => {
  test('sends message to target', async () => {
    const name1 = 'background'
    const port1 = Port(name1)
    ports.set(name1, port1)

    const name2 = 'options'
    const port2 = Port(name2)
    ports.set(name2, port2)

    const message: CoreMessage = {
      id: 'asdf12334',
      target: name2,
      payload: {
        greeting: 'set-options',
      },
    }
    await onlySend(message.payload, message.target)

    expect(port1.postMessage).not.toBeCalled()
    expect(port2.postMessage).toBeCalled()
  })

  test('resolves immediately', async () => {
    expect.assertions(1)

    const name1 = 'background'
    const port1 = Port(name1)
    ports.set(name1, port1)

    const payload = 'hey there'
    const result = await onlySend(payload, name1)

    expect(result).toBeUndefined()
  })

  test.only('rejects if page is not registered', (done) => {
    expect.assertions(1)

    const name1 = 'background'
    const port1 = Port(name1)
    ports.set(name1, port1)

    const payload = 'hey there'
    const target = 'options'

    return onlySend(payload, target).catch((error) => {
      expect(error).toEqual(
        new Error(`The port "${target}" is not registered`),
      )

      done()
    })
  })

  test('rejects if postMessage throws', () => {
    expect.assertions(1)

    const name1 = 'background'
    const port1 = Port(name1)
    ports.set(name1, port1)

    const postError = new Error('postError')
    // @ts-ignore postMessage is jest.fn()
    port1.postMessage.mockImplementation(() => {
      throw postError
    })

    const payload = 'hey there'

    return expect(onlySend(payload, name1)).rejects.toBe(
      postError,
    )
  })
})
