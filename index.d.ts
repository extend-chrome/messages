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
  removeListener: (listener: MessageListener) => void
  hasListeners: () => boolean
  hasListener: (
    key: MessageListener | AsyncMessageListener,
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
    listener: AsyncMessageListener,
    target?: string | number | undefined,
  ) => void
  asyncSend: (
    message: any,
    target?: string | number | undefined,
  ) => Promise<any>
  off: (listener: MessageListener) => void
  on: (
    listener: MessageListener,
    target?: string | number | undefined,
  ) => void
  send: (
    message: any,
    target?: string | number | undefined,
  ) => Promise<void>
}
