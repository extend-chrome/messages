import assert from 'power-assert'
import { chrome, chromep, Port, Tab } from './jest.setup'

import {
  connect,
  handleConnect,
  handleDisconnect,
  connectAs,
} from '../src/connect'
import { ports } from '../src/ports'
import { frameName } from '../src/frames'

jest.mock('../src/connect')
jest.mock('../src/frames')

beforeEach(() => {
  jest.clearAllMocks()

  chrome.reset()
  chrome.runtime.connect.returns(Port('test'))

  ports.clear()
  delete ports.self
})

describe('connect', () => {
  beforeEach(() => {
    chrome.runtime.connect.returns(Port('test'))
  })

  test('should be mocked', () => {
    assert(jest.isMockFunction(connect))
  })

  test('calls chrome.runtime.connect', () => {
    const port = connect('test')

    assert(chrome.runtime.connect.called)
  })

  test('adds listener for port.onDisconnect', () => {
    const port = connect('test')

    expect(port.onDisconnect.addListener).toBeCalled()
  })
})

describe('handleConnect', () => {
  test('uses tab.id for port name', () => {
    const tabId = 1234
    const portName = 'content'
    const port = Port(portName, { tab: Tab({ id: tabId }) })

    handleConnect(port)

    assert(!ports.has(portName))
    expect(ports.get(tabId)).toBe(port)
  })

  test('uses port.name for port name', () => {
    const portName = 'background'
    const port = Port(portName)

    handleConnect(port)

    assert(ports.has(portName))
  })

  test('throws if tab.id and port.name are undefined', () => {
    const throws = (portName) => {
      handleConnect(Port(portName))
    }

    expect(throws).toThrow()
  })

  test('adds listener for port.onDisconnect', () => {
    const portName = 'background'
    const port = Port(portName)

    handleConnect(port)

    expect(port.onDisconnect.addListener).toBeCalled()
  })

  test('calls connect', () => {
    const portName = 'background'
    const port = Port(portName)

    handleConnect(port)

    expect(ports.self).toBeDefined()
  })
})

describe('handleDisconnect', () => {
  test('logs last error', () => {
    const logError = console.error
    console.error = jest.fn()

    const message = 'there was an error!'
    chrome.runtime.lastError = { message }

    const portName = 'background'
    const port = Port(portName)

    handleConnect(port)
    handleDisconnect(portName)(port)

    expect(console.error).toBeCalledWith(message)

    console.error = logError
  })

  test('does not log if no error', () => {
    const logError = console.error
    console.error = jest.fn()

    chrome.runtime.lastError = undefined

    const portName = 'background'
    const port = Port(portName)

    handleConnect(port)
    handleDisconnect(portName)(port)

    expect(console.error).not.toBeCalled()

    console.error = logError
  })

  test('deletes port', () => {
    const portName = 'background'
    const port = Port(portName)

    handleConnect(port)

    assert(ports.has('background'))

    handleDisconnect(portName)(port)

    assert(!ports.has('background'))
  })
})

describe('connectAs', () => {
  test('adds listener for chrome.runtime.onConnect', () => {
    connectAs()

    assert(chrome.runtime.onConnect.addListener.called)
  })

  test('calls connect', () => {
    connectAs()

    expect(ports.self).toBeDefined()
  })
})
