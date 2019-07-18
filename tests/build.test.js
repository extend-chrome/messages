import {
  messages,
  onMessage,
  sendMessage,
} from '../build/bumble-messages-esm'

test('build includes all exports', () => {
  expect(messages).toHaveProperty('send')
  expect(messages).toHaveProperty('on')

  expect(messages).toHaveProperty('asyncSend')
  expect(messages).toHaveProperty('asyncOn')

  expect(onMessage).toHaveProperty('addListener')
  expect(onMessage).toHaveProperty('removeListener')
  expect(onMessage).toHaveProperty('hasListener')
  expect(onMessage).toHaveProperty('hasListeners')

  expect(sendMessage).toBeInstanceOf(Function)
})
