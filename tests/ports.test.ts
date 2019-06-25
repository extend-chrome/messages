import * as assert from 'power-assert'
import { chrome, chromep, Port, Tab } from './jest.setup'

import { createEvent, createPorts } from '../src/ports'

describe('createEvent', () => {
  test('creates unique events', () => {
    const selector = (x: any) => [x]

    const event1 = createEvent(selector)
    const event2 = createEvent(selector)

    expect(event1).not.toBe(event2)

    const spy1 = jest.fn()
    const spy2 = jest.fn()

    event1.addListener(spy1)
    event2.addListener(spy2)

    expect(spy1).not.toBeCalled()
    expect(spy2).not.toBeCalled()

    const event = { message: 'test' }
    event1.next(event)

    expect(spy1).toBeCalled()
    expect(spy2).not.toBeCalled()
  })
})

describe.only('EventIterator', () => {
  test('hasListeners', () => {
    const selector = (x: any) => [x]
    const event = createEvent(selector)
    const spy = jest.fn()

    assert(!event.hasListeners())

    event.addListener(spy)

    assert(event.hasListeners())

    expect(spy).not.toBeCalled()
  })

  test('hasListener 1', () => {
    const selector = (x: any) => [x]
    const event = createEvent(selector)
    const spy = jest.fn()

    assert(!event.hasListener(spy))

    event.addListener(spy)

    assert(event.hasListener(spy))

    expect(spy).not.toBeCalled()
  })

  test('hasListener 2', () => {
    const selector = (x: any) => [x]
    const event = createEvent(selector)
    const spy1 = jest.fn()
    const spy2 = jest.fn()

    event.addListener(spy1)

    assert(!event.hasListener(spy2))
  })

  test('addListener', () => {
    const selector = (x: any) => [x]
    const event = createEvent(selector)
    const spy = jest.fn()

    event.addListener(spy)

    assert(event.hasListener(spy))
    assert(event.hasListeners())

    expect(spy).not.toBeCalled()
  })

  test('removeListener 1', () => {
    const selector = (x: any) => [x]
    const event = createEvent(selector)
    const spy = jest.fn()

    event.addListener(spy)
    event.removeListener(spy)

    assert(!event.hasListener(spy))

    expect(spy).not.toBeCalled()
  })

  test('removeListener 2', () => {
    const selector = (x: any) => [x]
    const event = createEvent(selector)
    const spy1 = jest.fn()
    const spy2 = jest.fn()

    event.addListener(spy1)
    event.addListener(spy2)

    assert(event.hasListener(spy1))
    assert(event.hasListener(spy2))

    event.removeListener(spy1)

    assert(!event.hasListener(spy1))
    assert(event.hasListener(spy2))

    expect(spy1).not.toBeCalled()
    expect(spy2).not.toBeCalled()
  })

  test('next 1', () => {
    const selector = (x: any) => [x]
    const event = createEvent(selector)
    const spy = jest.fn()

    event.addListener(spy)
    event.next('test')

    expect(spy).toBeCalled()
    expect(spy).toBeCalledWith('test')
  })

  test('next 2', () => {
    const selector = (x: any) => [x, 1]
    const event = createEvent(selector)
    const spy1 = jest.fn()
    const spy2 = jest.fn()

    event.addListener(spy1)
    event.addListener(spy2)
    event.next('test1')
    event.next('test2')
    event.removeListener(spy1)
    event.next('test3')

    expect(spy1).toBeCalledTimes(2)
    expect(spy1).toBeCalledWith('test1', 1)
    expect(spy1).toBeCalledWith('test2', 1)
    expect(spy1).not.toBeCalledWith('test3', 1)

    expect(spy2).toBeCalledTimes(3)
    expect(spy2).toBeCalledWith('test1', 1)
    expect(spy2).toBeCalledWith('test2', 1)
    expect(spy2).toBeCalledWith('test3', 1)
  })
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

describe('Ports#onConnect', () => {
  test.todo('calls all listeners on new port')
})

describe('Ports#onMessage', () => {
  test.todo('calls all listeners on new message')
})
