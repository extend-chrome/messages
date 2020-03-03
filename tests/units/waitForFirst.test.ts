import { Subject } from 'rxjs'
import { setupWaitForFirst } from '../../src/waitForFirst'

test('resolves on first item', async () => {
  const subject = new Subject<number>()
  const waitForFirst = setupWaitForFirst(subject)
  const waiting = waitForFirst()

  setTimeout(() => {
    subject.next(1)
  }, 500);

  expect(await waiting).toBe(1)
})

test('resolves on first item that matches predicate', async () => {
  const subject = new Subject<number>()
  const waitForFirst = setupWaitForFirst(subject)
  const waiting = waitForFirst((n) => n === 2)

  subject.next(1)
  
  setTimeout(() => {
    subject.next(1)
  }, 500);

  setTimeout(() => {
    subject.next(2)
  }, 1000);

  expect(await waiting).toBe(2)
})

test('does not resolve if no match', async (done) => {
  const subject = new Subject<number>()
  const waitForFirst = setupWaitForFirst(subject)
  const waiting = waitForFirst((n) => n === 3)

  subject.next(1)
  subject.next(2)

  // waiting never resolved, pass!
  setTimeout(done, 2000)

  expect(await waiting).toBe(3)
})
