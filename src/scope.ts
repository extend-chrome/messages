import { fromEventPattern, merge, Observable } from 'rxjs'
import { filter, map } from 'rxjs/operators'
import { scopeAsyncOn, scopeOff, scopeOn } from './events'
import { scopeAsyncSend, scopeSend } from './send'
import { AsyncMessageListener, MessageListener } from './types'

/** The tab that sent the message */
type Sender = chrome.runtime.MessageSender

/**
 * Get a messages scope by name.
 */
export function useScope(scope: string) {
  const _asyncOn = scopeAsyncOn(scope)
  const _asyncSend = scopeAsyncSend(scope)
  const _off = scopeOff(scope)
  const _on = scopeOn(scope)
  const _send = scopeSend(scope)

  /**
   * Send a message. Options are optional.
   *
   * @param [options.async] Set to true to receive a response.
   * @param [options.target] Either a tab id or a target name. Use to send to a tab or a specific listener.
   */
  function send<T, R>(
    data: T,
    options: {
      target?: number | string
      async: true
    },
  ): Promise<R>
  function send<T>(
    data: T,
    options: {
      target?: number | string
    },
  ): Promise<void>
  function send<T>(data: T): Promise<void>
  async function send<T, R>(
    data: T,
    options?: {
      target?: number | string
      async?: true
    },
  ) {
    const { async = false, target } = options || {}

    if (async) {
      return _asyncSend(data, target)
    } else {
      return _send(data, target)
    }
  }

  /** Listen for messages. */
  function on<T, R>(
    callback: (
      data: T,
      sender: Sender,
      respond: (data: R) => void,
    ) => void,
    target?: string,
  ): void
  function on<T>(
    callback: (data: T, sender: Sender) => void,
    target?: string,
  ): void
  function on<T>(
    callback: (data: T) => void,
    target?: string,
  ): void
  function on(
    callback: MessageListener | AsyncMessageListener,
    target?: string | number,
  ) {
    if (isMessageListener(callback)) {
      _on(callback, target)
    } else {
      _asyncOn(callback, target)
    }

    function isMessageListener(
      x: Function,
    ): x is MessageListener {
      return x.length < 3
    }
  }

  /** Remove a message listener from `on`. */
  function off(
    fn: MessageListener | AsyncMessageListener,
  ): void {
    return _off(fn)
  }

  /** Untyped Observable of all messages in scope */
  const stream = merge(
    fromEventPattern<[any, Sender]>(_on, _off),
    fromEventPattern<[any, Sender, ((data: any) => void)]>(
      _asyncOn,
      _off,
    ),
  )

  const _greetings = new Set()

  /**
   * Get a paired send function and message Observable.
   *
   * @param greeting Unique id for message
   * @param options.async Set true to send a response from the Observable
   */
  function useLine<T, R>(
    greeting: string,
    options: { async: true },
  ): [
    (
      data: T,
      options?: {
        target: string | number
      },
    ) => Promise<R>,
    Observable<[T, Sender, ((response: R) => void)]>,
  ]
  function useLine<T>(
    greeting: string,
  ): [
    (
      data: T,
      options?: {
        target: string | number
      },
    ) => Promise<void>,
    Observable<[T, Sender]>,
  ]
  function useLine<T, R>(
    greeting: string,
    options?: { async: true },
  ) {
    if (_greetings.has(greeting))
      throw new Error('greeting is not unique')

    _greetings.add(greeting)

    const { async } = options || {}

    const _send = (
      data: T,
      _options?: { target: number | string },
    ) => {
      interface LineMessage {
        greeting: string
        data: T
      }

      const { target } = _options || {}

      if (async) {
        return send<LineMessage, R>(
          { greeting, data },
          {
            async,
            target,
          },
        )
      } else {
        return send<LineMessage>({ greeting, data }, { target })
      }
    }

    if (async) {
      const _stream: Observable<
        [T, Sender, ((response: R) => void)]
      > = stream.pipe(
        // Filter line messages
        filter((x) => {
          return x[0].greeting === greeting
        }),
        // Map message to data
        map(([{ data }, s, r]) => [data, s, r]),
        filter(
          (x): x is [T, Sender, ((response: R) => void)] =>
            x.length === 3,
        ),
      )

      return [_send, _stream]
    } else {
      const _stream: Observable<[T, Sender]> = stream.pipe(
        // Filter line messages
        filter((x) => {
          return x[0].greeting === greeting
        }),
        // Map message to data
        map(([{ data }, s]) => [data, s]),
        filter((x): x is [T, Sender] => x.length < 3),
      )

      return [_send, _stream]
    }
  }

  return {
    send,
    on,
    off,
    stream,
    useLine,
  }
}
