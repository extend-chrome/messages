export const createEvent = (
  nextSelector: (...args: any[]) => any[],
) => {
  const _cbs: Set<Function> = new Set()

  return {
    addListener(cb: Function) {
      _cbs.add(cb)
    },
    hasListener(cb: Function) {
      return _cbs.has(cb)
    },
    hasListeners() {
      return _cbs.size > 0
    },
    next(...args: any[]) {
      _cbs.forEach((l) => {
        l(...nextSelector(...args))
      })
    },
    removeListener(cb: Function) {
      _cbs.delete(cb)
    },
  }
}

export const createPorts = (): Ports => {
  const ports = new Map()

  const onConnect = createEvent((name, port) => {
    return [name, port, ports]
  })

  const onMessage = createEvent((message, port) => {
    return [message, port, ports]
  })

  return Object.assign(ports, {
    onConnect,
    onMessage,
  })
}

export const ports: Ports = createPorts()
