import { Subject } from 'rxjs'

export type AsyncMockMessage<T, R> = [
  jest.Mock<Promise<R>, [T, { target: string | number }] | [T]>,
  Subject<[T, chrome.runtime.MessageSender, (response: R) => void]>,
]

export type MockMessage<T> = [
  jest.Mock<Promise<void>, [T, { target: string | number }] | [T]>,
  Subject<[T, chrome.runtime.MessageSender]>,
]

export function getMessage<T, R>(
  greeting: string,
  options: { async: true },
): AsyncMockMessage<T, R>
export function getMessage<T>(greeting: string): MockMessage<T>
export function getMessage<T, R>() {
  return [jest.fn(), new Subject()] as AsyncMockMessage<T, R> | MockMessage<T>
}
