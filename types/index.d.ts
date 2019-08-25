/// <reference types="chrome" />
export declare const onMessage: {
  addListener: (
    listener: (
      message: {
        [prop: string]: any
        greeting: string
      },
      sender: chrome.runtime.MessageSender,
      sendResponse?: ((response?: any) => void) | undefined,
    ) => void,
    {
      target,
      async,
    }?: {
      target?: string | undefined
      async?: boolean | undefined
    },
  ) => void
  removeListener: (
    listener: import('./types').MessageListener,
  ) => void
  hasListeners: () => boolean
  hasListener: (
    key:
      | import('./types').MessageListener
      | import('./types').AsyncMessageListener,
  ) => boolean
}
export declare const sendMessage: (
  message: {
    [prop: string]: any
    greeting: string
  },
  {
    target,
    async,
  }?: {
    target?: string | undefined
    async?: boolean | undefined
  },
) => Promise<any>
export declare const messages: {
  asyncOn: (
    listener: import('./types').AsyncMessageListener,
    target?: string | number | undefined,
  ) => void
  asyncSend: (
    message: any,
    target?: string | number | undefined,
  ) => Promise<any>
  off: (listener: import('./types').MessageListener) => void
  on: (
    listener: import('./types').MessageListener,
    target?: string | number | undefined,
  ) => void
  send: (
    message: any,
    target?: string | number | undefined,
  ) => Promise<void>
}
