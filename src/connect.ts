import { frameName } from './frames'

import { ports } from './ports'

// FIXME: error if send is called before ports can finish registering
// messages sent on first tick must be queued until registration finishes
export const connect = (name: string): chrome.runtime.Port => {
  const port = chrome.runtime.connect({ name })

  port.onDisconnect.addListener(() => {
    if (chrome.runtime.lastError) {
      delete ports.self
    }
  })

  ports.self = port

  return port
}

export const handleConnect = (
  port: chrome.runtime.Port,
): void => {
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
    ports.set(name, port)

    port.onDisconnect.addListener(handleDisconnect(name))

    connect(frameName)

    // console.log('connected to', name)
  }
}

export const handleDisconnect = (name: TargetName) => (
  port: chrome.runtime.Port,
): void => {
  if (chrome.runtime.lastError) {
    console.error(chrome.runtime.lastError.message)
  }

  ports.delete(name)

  // console.log('disconnected from', name)
}

/* -------------------------------------------- */
/*             START TRACKING PORTS             */
/* -------------------------------------------- */

export const connectAs = (name = frameName): void => {
  // Listen for new pages
  chrome.runtime.onConnect.addListener(handleConnect)

  // Discover other pages
  connect(frameName)
}
