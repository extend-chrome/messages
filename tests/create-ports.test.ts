import * as assert from 'power-assert'
import { chrome, chromep, Port, Tab } from './jest.setup'
import { createPorts } from '../src/create-ports'

beforeEach(() => {
  jest.clearAllMocks()
})

describe('createPorts', () => {
  test('creates unique ports', () => {
    const ports1 = createPorts()
    const ports2 = createPorts()

    expect(ports1).not.toBe(ports2)

    const spy1 = jest.fn()
    const spy2 = jest.fn()

    ports1.onMessage.addListener(spy1)

    assert(ports1.onMessage.hasListeners())
    assert(!ports2.onMessage.hasListeners())

    ports2.onMessage.addListener(spy2)

    const port = Port('background')
    const message: JsonifiableMessage = {
      id: 'asdf12334',
      target: 'options',
      payload: {
        greeting: 'set-options',
      },
      only: true,
    }

    ports1.onMessage.next(message, port)

    expect(spy1).toBeCalled()
    expect(spy2).not.toBeCalled()
  })
})

describe('Ports emulates Map', () => {
  test('set, get, size', () => {
    const ports = createPorts()

    const name1 = 'background'
    const port1 = Port(name1)
    ports.set(name1, port1)

    expect(ports.size).toBe(1)

    const name2 = 'options'
    const port2 = Port(name2)
    ports.set(name2, port2)

    expect(ports.size).toBe(2)

    expect(ports.get(name1)).toBe(port1)
    expect(ports.get(name2)).toBe(port2)
  })

  test('has', () => {
    const ports = createPorts()

    const name1 = 'background'
    const port1 = Port(name1)
    ports.set(name1, port1)

    const name2 = 'options'
    const port2 = Port(name2)
    ports.set(name2, port2)

    assert(ports.has(name1))
    assert(ports.has(name2))

    ports.delete(name1)

    assert(!ports.has(name1))
    assert(ports.has(name2))
  })

  test('forEach', () => {
    const ports = createPorts()

    const name1 = 'background'
    const port1 = Port(name1)
    ports.set(name1, port1)

    const name2 = 'options'
    const port2 = Port(name2)
    ports.set(name2, port2)

    const spy = jest.fn()
    ports.forEach(spy)

    expect(spy).toBeCalledTimes(2)
  })

  test('entries', () => {
    const ports = createPorts()

    const name1 = 'background'
    const port1 = Port(name1)
    ports.set(name1, port1)

    const name2 = 'options'
    const port2 = Port(name2)
    ports.set(name2, port2)

    const entries = [...ports.entries()]

    expect(entries).toEqual([[name1, port1], [name2, port2]])
  })

  test('keys', () => {
    const ports = createPorts()

    const name1 = 'background'
    const port1 = Port(name1)
    ports.set(name1, port1)

    const name2 = 'options'
    const port2 = Port(name2)
    ports.set(name2, port2)

    const keys = [...ports.keys()]

    expect(keys).toEqual([name1, name2])
  })

  test('values', () => {
    const ports = createPorts()

    const name1 = 'background'
    const port1 = Port(name1)
    ports.set(name1, port1)

    const name2 = 'options'
    const port2 = Port(name2)
    ports.set(name2, port2)

    const values = [...ports.values()]

    expect(values).toEqual([port1, port2])
  })
})

describe('Ports#onConnect', () => {
  test('fires when a port is added', () => {
    const ports = createPorts()

    const spy = jest.fn()
    ports.onConnect.addListener(spy)

    const name = 'background'
    const port = Port(name)
    ports.set(name, port)

    expect(spy).toBeCalled()
    expect(spy).toBeCalledWith(name, port, ports)
  })

  test('adds listener to port.onMessage', () => {
    const ports = createPorts()

    const name = 'background'
    const port = Port(name)
    ports.set(name, port)

    const spy = port.onMessage.addListener

    expect(spy).toBeCalled()
  })
})

describe('Ports#onMessage', () => {
  test('fires on new message', () => {
    const ports = createPorts()

    const name = 'background'
    const port = Port(name)
    ports.set(name, port)

    const spy = jest.fn()
    ports.onMessage.addListener(spy)

    const message: JsonifiableMessage = {
      id: 'asdf12334',
      target: 'options',
      payload: {
        greeting: 'set-options',
      },
      only: true,
    }
    port.postMessage(message)

    expect(spy).toBeCalled()
  })
})

describe('Ports#clear', () => {
  test('removes all ports', () => {
    const ports = createPorts()

    const name1 = 'background'
    const port1 = Port(name1)
    ports.set(name1, port1)

    const name2 = 'options'
    const port2 = Port(name2)
    ports.set(name2, port2)

    ports.clear()

    expect(ports.size).toBe(0)
  })

  test('disconnects all ports', () => {
    const ports = createPorts()

    const name1 = 'background'
    const port1 = Port(name1)
    ports.set(name1, port1)

    const name2 = 'options'
    const port2 = Port(name2)
    ports.set(name2, port2)

    ports.clear()

    expect(port1.disconnect).toBeCalled()
    expect(port2.disconnect).toBeCalled()
  })
})

describe('Ports#delete', () => {
  test('removes a specific port', () => {
    const ports = createPorts()

    const name1 = 'background'
    const port1 = Port(name1)
    ports.set(name1, port1)

    const name2 = 'options'
    const port2 = Port(name2)
    ports.set(name2, port2)

    const success1 = ports.delete(name1)

    expect(ports.size).toBe(1)
    assert(success1)

    const failure1 = ports.delete('not-here')

    expect(ports.size).toBe(1)
    assert(!failure1)

    const success2 = ports.delete(name2)

    expect(ports.size).toBe(0)
    assert(success2)

    const failure2 = ports.delete(name1)

    expect(ports.size).toBe(0)
    assert(!failure2)
  })

  test('disconnects a specific port', () => {
    const ports = createPorts()

    const name1 = 'background'
    const port1 = Port(name1)
    ports.set(name1, port1)

    const name2 = 'options'
    const port2 = Port(name2)
    ports.set(name2, port2)

    ports.delete(name1)

    expect(port1.disconnect).toBeCalled()
    expect(port2.disconnect).not.toBeCalled()
  })
})
