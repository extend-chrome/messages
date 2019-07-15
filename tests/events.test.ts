import { onMessage, onOnlyMessage } from '../src/events'
import { Port } from './jest.setup'
import { ports } from '../src/ports'

jest.mock('../src/frames')

jest.setTimeout(500)

afterEach(() => {
  ports.clear()
})

describe('onMessage', () => {
  afterEach(() => {
    onMessage.clearListeners()
  })

  test('receives messages addressed to target', (done) => {
    expect.assertions(1)

    const name1 = 'background'
    const port1 = Port(name1)
    ports.set(name1, port1)

    const name2 = 'options'
    const port2 = Port(name2)
    ports.set(name2, port2)

    const respondable: CoreMessage = {
      id: 'asdf12334',
      target: name1,
      sender: name2,
      payload: 'should receive',
    }

    onMessage.addListener(handleMessage, name1)
    onMessage.callListeners(respondable, port2)

    function handleMessage(received: any) {
      expect(received).toBe(respondable.payload)

      done()
    }
  })

  test('receives respondable message', (done) => {
    expect.assertions(1)

    const name1 = 'background'
    const port1 = Port(name1)
    ports.set(name1, port1)

    const name2 = 'options'
    const port2 = Port(name2)
    ports.set(name2, port2)

    const respondable: CoreMessage = {
      id: 'asdf12334',
      target: name1,
      sender: name2,
      payload: {
        greeting: 'set-options',
      },
    }

    onMessage.addListener(handleMessage, name1)

    onMessage.callListeners(respondable, port2)

    function handleMessage(received: any) {
      expect(received).toBe(respondable.payload)

      done()
    }
  })

  test('does not receive only message', (done) => {
    expect.assertions(1)

    const name1 = 'background'
    const port1 = Port(name1)
    ports.set(name1, port1)

    const name2 = 'options'
    const port2 = Port(name2)
    ports.set(name2, port2)

    const message: CoreMessage = {
      id: 'asdf12334',
      target: name1,
      payload: 'should not receive',
    }

    const respondable: CoreMessage = {
      id: 'asdf12334',
      target: name1,
      sender: name2,
      payload: 'should receive',
    }

    onMessage.addListener(handleMessage, name1)

    onMessage.callListeners(message, port2)
    onMessage.callListeners(respondable, port2)

    function handleMessage(received: any) {
      expect(received).toEqual(respondable.payload)

      done()
    }
  })

  test('sendResponse sends response via port.postMessage', (done) => {
    expect.assertions(1)

    const name1 = 'background'
    const port1 = Port(name1)
    ports.set(name1, port1)

    const name2 = 'options'
    const port2 = Port(name2)
    ports.set(name2, port2)

    const respondable: CoreMessage = {
      id: 'asdf12334',
      target: name1,
      sender: name2,
      payload: {
        greeting: 'set-options',
      },
    }

    onMessage.addListener(handleMessage, name1)
    onMessage.callListeners(respondable, port2)

    function handleMessage(
      received: any,
      sendResponse: SendResponse,
    ) {
      sendResponse('respond this')

      expect(port2.postMessage).toBeCalled()

      done()
    }
  })
})

describe('onOnlyMessage', () => {
  afterEach(() => {
    onOnlyMessage.clearListeners()
  })

  test('receives messages addressed to target', (done) => {
    expect.assertions(1)

    const name1 = 'background'
    const port1 = Port(name1)
    ports.set(name1, port1)

    const name2 = 'options'
    const port2 = Port(name2)
    ports.set(name2, port2)

    const message: CoreMessage = {
      id: 'asdf12334',
      target: name1,
      payload: 'message',
    }

    onOnlyMessage.addListener(handleMessage, name1)

    onOnlyMessage.callListeners(message, port2)

    function handleMessage(received: any) {
      expect(received).toBe(message.payload)

      done()
    }
  })

  test('receives only message', (done) => {
    expect.assertions(1)

    const name1 = 'background'
    const port1 = Port(name1)
    ports.set(name1, port1)

    const name2 = 'options'
    const port2 = Port(name2)
    ports.set(name2, port2)

    const message: CoreMessage = {
      id: 'asdf12334',
      target: name1,
      payload: 'message',
    }

    onOnlyMessage.addListener(handleMessage, name1)

    onOnlyMessage.callListeners(message, port2)

    function handleMessage(received: any) {
      expect(received).toBe(message.payload)

      done()
    }
  })

  test('does not receive respondable message', (done) => {
    expect.assertions(1)

    const name1 = 'background'
    const port1 = Port(name1)
    ports.set(name1, port1)

    const name2 = 'options'
    const port2 = Port(name2)
    ports.set(name2, port2)

    const message: CoreMessage = {
      id: 'asdf12334',
      target: name1,
      payload: 'should receive',
    }

    const respondable: CoreMessage = {
      id: 'asdf12334',
      target: name1,
      sender: name2,
      payload: 'should not receive',
    }

    onOnlyMessage.addListener(handleMessage, name1)

    onOnlyMessage.callListeners(respondable, port2)
    onOnlyMessage.callListeners(message, port2)

    function handleMessage(received: any) {
      expect(received).toEqual(message.payload)

      done()
    }
  })
})
