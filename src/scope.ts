import { fromEventPattern, merge, Observable } from 'rxjs'
import { filter, map } from 'rxjs/operators'
import { scopeAsyncOn, scopeOff, scopeOn } from './events'
import { scopeAsyncSend, scopeSend } from './send'
import { AsyncMessageListener, AsyncSendOptions, MessageListener, Sender, SendOptions } from './types'
import { setupWaitForFirst } from './waitForFirst'

/**
 * Get a messages scope by name.
 */
export function getScope(scope: string) {
  const _asyncOn = scopeAsyncOn(scope)
  const _asyncSend = scopeAsyncSend(scope)
  const _off = scopeOff(scope)
  const _on = scopeOn(scope)
  const _send = scopeSend(scope)

  /* ---------------------- SEND --------------------- */

  /**
   * Send a message. Options are optional.
   *
   * @param [options.async] Set to true to receive a response.
   * @param [options.target] Either a tab id or a target name. Use to send to a tab or a specific listener.
   */
  function send<T, R>(data: T, options: AsyncSendOptions): Promise<R>
  function send<T>(data: T, options: SendOptions): Promise<void>
  function send<T>(data: T): Promise<void>
  async function send<T, R>(data: T, options?: SendOptions & { async?: true }) {
    const _options: any = options || {}
    _options.target = _options.target || _options.tabId
    const { async = false, target } = _options

    if (async) {
      return _asyncSend(data, target)
    } else {
      return _send(data, target)
    }
  }

  /* -------------------- RECEIVE -------------------- */

  /** Listen for messages. */
  function on<T, R>(
    callback: (data: T, sender: Sender, respond: (data: R) => void) => void,
  ): void
  function on<T>(callback: (data: T, sender: Sender) => void): void
  function on(callback: MessageListener | AsyncMessageListener) {
    if (isMessageListener(callback)) {
      _on(callback)
    } else {
      _asyncOn(callback)
    }

    function isMessageListener(x: Function): x is MessageListener {
      return x.length < 3
    }
  }

  /** Remove a message listener from `on`. */
  function off(fn: MessageListener | AsyncMessageListener): void {
    return _off(fn)
  }

  /** Untyped Observable of all messages in scope */
  const stream = merge(
    fromEventPattern<[any, Sender]>(_on, _off),
    fromEventPattern<[any, Sender, (data: any) => void]>(_asyncOn, _off),
  )

  /* ------------------ GET MESSAGE ----------------- */

  const _greetings = new Set()

  /**
   * Get a paired send function and message Observable.
   *
   * @param greeting Unique id for message
   * @param options.async Set true to send a response from the Observable
   */
  function getMessage<T, R>(
    greeting: string,
    options: { async: true },
  ): [
    ((data: T, options?: SendOptions) => Promise<R>) & {
      toTab: (options?: SendOptions) => Promise<R>
    },
    Observable<[T, Sender, (response: R) => void]>,
    (predicate?: (x: T) => boolean) => Promise<T>,
  ]
  function getMessage<T>(
    greeting: string,
  ): [
    ((data: T, options?: SendOptions) => Promise<void>) & {
      toTab: (options?: SendOptions) => Promise<void>
    },
    Observable<[T, Sender]>,
    (predicate?: (x: T) => boolean) => Promise<T>,
  ]
  function getMessage<T, R>(greeting: string, options?: { async: true }) {
    if (_greetings.has(greeting)) throw new Error('greeting is not unique')

    _greetings.add(greeting)

    const { async } = options || {}

    const _send = (data: T, _options?: SendOptions) => {
      interface WrappedMessage {
        greeting: string
        data: T
      }

      _options = _options || ({} as SendOptions)
      let tabId: number | undefined
      if (typeof _options.tabId === 'number') {
        tabId = _options.tabId
      }

      if (async) {
        return send<WrappedMessage, R>({ greeting, data }, { async, tabId })
      } else {
        return send<WrappedMessage>({ greeting, data }, { tabId })
      }
    }

    /** Use this to send a message with no data to a tab */
    _send.toTab = ({ tabId }: { tabId: number }) => {
      interface WrappedMessage {
        greeting: string
      }

      if (async) {
        return send<WrappedMessage, R>({ greeting }, { async, tabId })
      } else {
        return send<WrappedMessage>({ greeting }, { tabId })
      }
    }

    if (async) {
      const _stream: Observable<[
        T,
        Sender,
        (response: R) => void,
      ]> = stream.pipe(
        // Filter line messages
        filter(isMatchingMessage),
        // Map message to data
        map(([{ data }, s, r]) => [data, s, r]),
        filter((x): x is [T, Sender, (response: R) => void] => x.length === 3),
      )

      return [_send, _stream, setupWaitForFirst(stream)]
    } else {
      const _stream: Observable<[T, Sender]> = stream.pipe(
        // Filter line messages
        filter(isMatchingMessage),
        // Map message to data
        map(([{ data }, s]) => [data, s]),
        filter((x): x is [T, Sender] => x.length < 3),
      )

      return [_send, _stream, setupWaitForFirst(_stream)]
    }

    function isMatchingMessage([x]: any[]) {
      return x && typeof x === 'object' && x.greeting === greeting
    }
  }

  return {
    send,
    on,
    off,
    stream,
    getMessage,
  }
}
