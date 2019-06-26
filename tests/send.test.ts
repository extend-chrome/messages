import { ports } from '../src/ports'
import { send, onlySend } from '../src/send'
import { Port } from './jest.setup'

jest.mock('../src/frames')

describe('send', () => {
  test('gets port by name', async () => {
    const name1 = 'background'
    const port1 = Port(name1)
    ports.set(name1, port1)

    const name2 = 'options'
    const port2 = Port(name2)
    ports.set(name2, port2)

    const message: JsonifiableMessage = {
      id: 'asdf12334',
      target: 'options',
      payload: {
        greeting: 'set-options',
      },
      only: true,
    }
    send(message.payload, message.target)

    expect(port1.postMessage).not.toBeCalled()
    expect(port2.postMessage).toBeCalled()
  })

  test('resolves on matching response', async () => {
    expect.assertions(1)

    const name1 = 'background'
    const port1 = Port(name1)
    ports.set(name1, port1)

    let once = 0
    port1.onMessage.addListener(({ id }) => {
      if (once === 0) {
        once++

        const response: JsonifiableResponse = {
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

        const response1: JsonifiableResponse = {
          id: 'abc123',
          payload: 'other',
          success: true,
          target: name1,
        }
        port1.postMessage(response1)

        const response2: JsonifiableResponse = {
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

  test('rejects on failure', async () => {
    expect.assertions(1)

    const name1 = 'background'
    const port1 = Port(name1)
    ports.set(name1, port1)

    let once = 0
    port1.onMessage.addListener(({ id }) => {
      if (once === 0) {
        once++

        const response2: JsonifiableResponse = {
          id,
          payload: 'some error',
          success: false,
          target: name1,
        }
        port1.postMessage(response2)
      }
    })

    const payload = 'hey there'

    return send(payload, name1).catch((reason) => {
      expect(reason).toBe('some error')
    })
  })
})

describe('onlySend', () => {
  test.todo('sends message')
  test.todo('resolves if no errors')
  test.todo('rejects if something throws')
})
