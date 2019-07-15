import { createEvent } from './event/create-event'

export const createPorts = (): Ports => {
  const _ports: Map<PortName, Port> = new Map()

  const onConnect = createEvent((name, port) => {
    return [name, port, ports]
  })

  const onMessage = createEvent((message, port) => {
    return [message, port, ports]
  })

  const setPort = (key: PortName, port: Port): Ports => {
    _ports.set(key, port)
    onConnect.callListeners(key, port)
    port.onDisconnect.addListener(() => {
      _ports.delete(key)
    })

    return ports

    // connect port won't send listeners
    // port.onMessage.addListener(onMessage.callListeners)
  }

  const clearPorts = () => {
    _ports.forEach((port) => {
      port.disconnect()
    })

    return _ports.clear()
  }

  const deletePort = (key: PortName) => {
    const port = _ports.get(key)

    if (port) {
      port.disconnect()
    }

    return !!port
  }

  const ports: Ports = {
    onConnect,
    onMessage,
    set: setPort,
    clear: clearPorts,
    delete: deletePort,
    get size() {
      return _ports.size
    },
    forEach: (cb) =>
      _ports.forEach((port, key) => cb(port, key, ports)),
    get: (key) => _ports.get(key),
    has: (key) => _ports.has(key),
    entries: () => _ports.entries(),
    keys: () => _ports.keys(),
    values: () => _ports.values(),
  }

  return ports
}
