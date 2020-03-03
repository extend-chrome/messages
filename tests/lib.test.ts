import {
  messages,
  getMessage,
  __defaultScopeName,
  getScope,
} from '../lib/index.esm'
import { Observable } from 'rxjs'

test('build includes all exports', () => {
  expect(__defaultScopeName).toBe('@bumble/messages__root')
  expect(getScope).toBeInstanceOf(Function)

  expect(messages).toMatchObject({
    send: expect.any(Function),
    on: expect.any(Function),
    off: expect.any(Function),
    stream: expect.any(Observable),
    getMessage: expect.any(Function),
  })

  expect(getMessage).toBe(messages.getMessage)
})
