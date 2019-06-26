import * as assert from 'power-assert'
import { createEvent } from '../src/create-event'

beforeEach(() => {
  jest.clearAllMocks()
})

describe('EventIterator', () => {
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

  test('next 3', () => {
    const selector = (x: string, y: number) => Array(y).fill(x)
    const event = createEvent(selector)
    const spy = jest.fn()

    event.addListener(spy)
    event.next('test', 3)

    expect(spy).toBeCalled()
    expect(spy).toBeCalledWith('test', 'test', 'test')
  })
})

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

    const event = { message: 'test' }
    event1.next(event)

    expect(spy1).toBeCalled()
    expect(spy2).not.toBeCalled()
  })
})
