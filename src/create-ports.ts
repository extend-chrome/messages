import { createEvent } from './event/create-event'

export const createPorts = (): Ports => {
  const _ports: Map<PortName, Port> = new Map()

  const onConnect = createEvent((name, port) => {
    // TODO: link port.onMessage to onMessage
    return [name, port, ports]
  })

  const onMessage = createEvent((message, port) => {
    return [message, port, ports]
  })

  const setPort = (key: PortName, port: Port): Ports => {
    _ports.set(key, port)
    onConnect.callListeners(key, port)
    port.onMessage.addListener(onMessage.callListeners)

    return ports
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

    return _ports.delete(key)
  }

  const ports: Ports = {
    set: setPort,
    clear: clearPorts,
    delete: deletePort,
    onConnect,
    onMessage,
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
