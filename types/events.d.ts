import {
  MessageListener,
  AsyncMessageListener,
  CoreListener,
} from './types'
export declare const _listeners: Map<
  MessageListener | AsyncMessageListener,
  CoreListener
>
export declare const on: (
  listener: MessageListener,
  target?: string | number | undefined,
) => void
export declare const asyncOn: (
  listener: AsyncMessageListener,
  target?: string | number | undefined,
) => void
export declare const off: (listener: MessageListener) => void
