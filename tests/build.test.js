import {
  messages,
  onMessage,
  sendMessage,
} from '../lib/index.esm'

test('build includes all exports', () => {
  expect(messages).toHaveProperty('send')
  expect(messages).toHaveProperty('on')
  expect(messages).toHaveProperty('off')
  expect(messages).toHaveProperty('stream')
})
