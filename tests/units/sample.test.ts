import * as chrome from 'sinon-chrome'
// import assert from 'power-assert'

let lastError: { message: string } | undefined
const lastErrorSpy = jest.fn(() => lastError)
Object.defineProperty(chrome.runtime, 'lastError', {
  get: lastErrorSpy,
})

afterEach(() => {
  lastError = undefined
  chrome.reset()
})

test.todo('write some tests!')
