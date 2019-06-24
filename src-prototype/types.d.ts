declare namespace Bumble.Messages {
  interface Messages {
    send: Send
    sendToFrame: Send
    sendToTab: Send
  }

  interface Ports {
    [propName: string]: chrome.runtime.Port
  }

  enum ExtensionFrame {
    'background',
    'options',
    'popup',
  }

  /**
   * @property {string} greeting - the message type id
   * @property {ExtensionFrame | string | number} target - tabId or extension frame name
   */
  interface Message {
    greeting: string
    target: ExtensionFrame | string | number
    [propName: string]: any
  }

  // TODO: can make send response conditional on message type?
  interface AsyncMessage extends Message {
    async: boolean
  }

  interface Send {
    (message: Message, _retries?: number): Promise<
      Response | undefined
    >
  }

  interface OnMessageCallback {
    (
      message: Bumble.Messages.Message,
      sender: chrome.runtime.MessageSender,
    ): Promise<Message> | Message | undefined
  }

  interface OnMessageUnsubscribe {
    (): void
  }

  /**
   * @property greeting - the message type id
   * @property success - the destination tab id
   */
  interface Response {
    greeting: string
    success: boolean
    [propName: string]: any
  }
}
