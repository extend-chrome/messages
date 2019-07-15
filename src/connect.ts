import { frameName } from './frames'
import { ports } from './ports'

export function startConnections(): void {
  // Listen for new pages
  chrome.runtime.onConnect.addListener(handleConnect)
}

export const connectTo = (
  target: TargetName,
  {
    sender = frameName,
    timeout,
  }: { sender?: string; timeout?: number } = {},
): Promise<chrome.runtime.Port> =>
  new Promise((resolve, reject) => {
    if (ports.has(target)) {
      resolve(ports.get(target))
    } else {
      /* --------------- start timeout -------------- */
      let timeoutId: any

      // TODO: need to cancel on resolve
      // TODO: debounced reject?
      timeoutId = setTimeout(() => {
        reject(
          new Error(`The port "${target}" is not registered`),
        )
        chrome.runtime.onConnect.removeListener(_resolvePort)
      }, timeout || 10000)

      /* ------------ resolve on connect ------------ */
      chrome.runtime.onConnect.addListener(_resolvePort)
      function _resolvePort(port: Port) {
        handleConnect(port)

        if (ports.has(target)) {
          console.log(`connected to ${target}`)
          resolve(ports.get(target))
          chrome.runtime.onConnect.removeListener(_resolvePort)
          timeoutId && clearTimeout(timeoutId)
        }
      }

      {
        let port: Port

        /* ------------- connect to frames ------------ */
        if (typeof target === 'string') {
          // TODO: handle connecting to new frames
          // target is a frame
          port = chrome.runtime.connect({ name: sender })
        } else if (typeof target === 'number') {
          // TODO: handle connecting to new tabs
          // TODO: handle postMessage to tab
          // target is a content script
          port = chrome.tabs.connect(target, { name: sender })
        } else {
          throw new TypeError(
            'Type of "target" must be number or string',
          )
        }

        /* --------- handle incoming messages --------- */

        port.onMessage.addListener(ports.onMessage.callListeners)

        /* ----------- handle no open ports ----------- */

        port.onDisconnect.addListener(_noOpenPorts)
        function _noOpenPorts() {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message))
            chrome.runtime.onConnect.removeListener(_resolvePort)
          }
        }
      }
    }
  })

export const handleConnect = (port: Port): void => {
  let name: string | number

  if (
    port.name === 'content' &&
    port.sender &&
    port.sender.tab &&
    port.sender.tab.id
  ) {
    name = port.sender.tab.id
  } else if (port.name) {
    name = port.name
  } else {
    throw new TypeError('Unable to derive port name')
  }

  if (!ports.has(name)) {
    connectTo(name)

    ports.set(name, port)

    port.onDisconnect.addListener(_deletePort)
  }

  function _deletePort(port: Port): void {
    if (chrome.runtime.lastError) {
      console.error(chrome.runtime.lastError.message)
    }

    ports.delete(name)

    console.log('disconnected from', name)
  }
}
