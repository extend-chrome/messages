import { getScope } from './scope'

// TODO: add function getLine
// - Get a sender and an Observable for a specific greeting

// TODO: define a messages area
// TODO: add a messages stream
// TODO: add an async messages stream

// function getLine<T>(greeting: string): [(data: T) => Promise<void>, Observable<[T, Sender]>]
// function getAsyncLine<T, R>(greeting: string): [(data: T) => Promise<R>, Observable<[T, Sender, (data: R) => void]>]
// const messages: Scope = { send, on, off, asyncSend, asyncOn, stream, asyncStream, onMessage }
// export { messages, getScope, getLine }

export const messages = getScope('@bumble/messages__root')

export { getScope }
