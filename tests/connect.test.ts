import assert from 'power-assert'
import { chrome, chromep } from './jest.setup'

import { connect } from '../src/connect'
import { ports } from '../src/ports'

jest.mock('../src/connect')
jest.mock('../src/frames')

describe('connect', () => {
  test('calls chrome.runtime.connect', () => {
    const port = connect('test')

    assert(chrome.runtime.connect.called)
  })

  test.todo('adds listener for port.onDisconnect')

  test.todo('should be mocked')
})

describe('handleConnect', () => {
  test.todo('uses tab.id for port name')
  test.todo('uses port.name for port name')
  test.todo('throws if tab.id and port.name are undefined')

  test.todo('adds port to ports object')
  test.todo('adds listener for port.onDisconnect')

  test.todo('calls connect')
})

describe('handleDisconnect', () => {
  test.todo('logs last error')
  test.todo('does not log if no error')

  test.todo('deletes port')
})

describe('connectAs', () => {
  test.todo('adds listener for chrome.runtime.onConnect')
  test.todo('calls connect')
})
