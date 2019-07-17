import { send, asyncSend } from './send'
import { on, asyncOn, off, _listeners } from './events'

export const onMessage = {
  addListener: (
    listener: (
      message: {
        greeting: string
        [prop: string]: any
      },
      sender: chrome.runtime.MessageSender,
      // W3C has deprecated sendResponse in favor of a promise
      sendResponse?: (response?: any) => void,
    ) => void,
    { name, async }: { name?: string; async?: boolean } = {},
  ) => {
    const _event = async ? asyncOn : on

    _event(listener, name)
  },
  removeListener: off,
  hasListeners: () => _listeners.size > 0,
  hasListener: _listeners.has,
}

export const sendMessage = (
  message: {
    greeting: string
    [prop: string]: any
  },
  { target, async }: { target?: string; async?: boolean } = {},
) => {
  const _send = async ? asyncSend : send

  return _send(message, target)
}

export const messages = {
  asyncOn,
  asyncSend,
  off,
  on,
  send,
}
