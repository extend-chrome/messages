import {
  messages,
  // getLine,
  // useLine,
  __defaultScopeName,
  useScope,
} from '../lib/index.esm'
import { Observable } from 'rxjs'

test('build includes all exports', () => {
  expect(__defaultScopeName).toBe('@bumble/messages__root')
  expect(useScope).toBeInstanceOf(Function)

  expect(messages).toMatchObject({
    send: expect.any(Function),
    on: expect.any(Function),
    off: expect.any(Function),
    stream: expect.any(Observable),
    useLine: expect.any(Function),
  })

  // expect(useLine).toBe(messages.getLine)
  // expect(getLine).toBe(messages.getLine)
})
