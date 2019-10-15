import { fromEventPattern, merge, Observable } from 'rxjs'
import { scopeAsyncOn, scopeOff, scopeOn } from './events'
import { scopeAsyncSend, scopeSend } from './send'
import { AsyncMessageListener, MessageListener } from './types'

/**
 * Get a messages scope by name.
 */
export function getScope(scope: string): MessagesScope {
  const _asyncOn = scopeAsyncOn(scope)
  const _asyncSend = scopeAsyncSend(scope)
  const _off = scopeOff(scope)
  const _on = scopeOn(scope)
  const _send = scopeSend(scope)

  async function send<T, R>(
    data: T,
    options?: {
      target?: number | string
      async?: boolean
    },
  ) {
    const { async = false, target } = options || {}

    if (async) {
      return _asyncSend(data, target)
    } else {
      return _send(data, target)
    }
  }

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

  const stream = merge(
    fromEventPattern<[any, Sender]>(_on, _off),
    fromEventPattern<[any, Sender, ((data: any) => void)]>(
      _asyncOn,
      _off,
    ),
  )

  return { send, on, off: _off, stream }
}

/**
 * A messages object that will send and receive messages only for that specfic scope name.
 */
export interface MessagesScope {
  /**
   * Send a message. Options are optional.
   *
   * @param [options.async] Set to true to receive a response.
   * @param [options.target] Either a tab id or a target name. Use to send to a tab or a specific listener.
   */
  send<T, R>(
    data: T,
    options: {
      target?: number | string
      async: boolean
    },
  ): Promise<R>
  send<T>(
    data: T,
    options: {
      target: number | string
    },
  ): Promise<void>
  send<T>(data: T): Promise<void>

  /** Listen for messages. */
  on<T, R>(
    callback: (
      data: T,
      sender: Sender,
      respond: (data: R) => void,
    ) => void,
    target?: string,
  ): void
  on<T>(
    callback: (data: T, sender: Sender) => void,
    target?: string,
  ): void
  on<T>(callback: (data: T) => void, target?: string): void

  /** Remove a message listener from `on`. */
  off(fn: MessageListener | AsyncMessageListener): void

  /**
   * Observable of messages.
   *
   * A tuple of data, the message sender, and an optional response function.
   * If the response function is present, it must be called at some point.
   */
  readonly stream: Observable<
    [any, Sender] | [any, Sender, ((data: any) => void)]
  >
}

/** The tab that sent the message */
type Sender = chrome.runtime.MessageSender
