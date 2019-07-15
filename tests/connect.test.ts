import * as assert from 'power-assert'
import {
  connectTo,
  startConnections,
  handleConnect,
} from '../src/connect'
import { ports } from '../src/ports'
import { chrome, Port, Tab } from './jest.setup'

jest.mock('../src/frames')

// We don't need logs here
console.log = () => {}

beforeEach(() => {
  jest.clearAllMocks()

  chrome.reset()
  chrome.runtime.connect.returns(Port('test'))

  ports.clear()
})

describe('startConnections', () => {
  test('adds listener for chrome.runtime.onConnect', () => {
    startConnections()

    assert(chrome.runtime.onConnect.addListener.called)
  })
})

describe('connectTo', () => {
  beforeEach(() => {
    chrome.runtime.connect.callsFake((options) => {
      const port = Port(options.name)

      ports.set(options.name, port)
      chrome.runtime.onConnect.triggerAsync(port)

      return port
    })

    chrome.tabs.connect.callsFake((tabId, options) => {
      const port = Port(options.name, { tab: Tab(tabId) })

      ports.set(options.name, port)
      chrome.runtime.onConnect.triggerAsync(port)

      return port
    })
  })

  test('calls chrome.runtime.connect', async () => {
    await connectTo('test', { timeout: 500 })

    assert(chrome.runtime.connect.called)
  })

  test('adds listener for port.onDisconnect', async () => {
    const port = await connectTo('test', { timeout: 500 })

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
    const throws = () => {
      // @ts-ignore
      handleConnect(Port())
    }

    expect(throws).toThrow(
      new TypeError('Unable to derive port name'),
    )
  })

  test('adds listener for port.onDisconnect', () => {
    const portName = 'background'
    const port = Port(portName)

    handleConnect(port)

    expect(port.onDisconnect.addListener).toBeCalled()
  })

  test('deletes port on disconnect', () => {
    const portName = 'background'
    const port = Port(portName)

    handleConnect(port)

    assert(ports.has('background'))

    port.disconnect()

    assert(!ports.has('background'))
  })
})
