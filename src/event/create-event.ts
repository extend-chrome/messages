type EventSelector = (...args: any[]) => any[] | null

export const createEvent = (
  selector: EventSelector,
  options?: boolean,
) => {
  if (options) {
    return createMapEvent(selector)
  } else {
    return createSetEvent(selector)
  }
}

export const createSetEvent = (selector: EventSelector) => {
  const _cbs: Set<Function> = new Set()

  return {
    addListener,
    hasListener,
    hasListeners,
    callListeners,
    clearListeners,
    removeListener,
    getEvent() {
      return {
        addListener,
        hasListener,
        hasListeners,
        removeListener,
      }
    },
  }

  function addListener(cb: Function) {
    _cbs.add(cb)
  }
  function hasListener(cb: Function) {
    return _cbs.has(cb)
  }
  function hasListeners() {
    return _cbs.size > 0
  }
  function callListeners(...args: any[]) {
    const cbArgs = selector(...args)

    if (cbArgs) {
      _cbs.forEach((cb) => {
        cb(...cbArgs)
      })
    }
  }
  function removeListener(cb: Function) {
    _cbs.delete(cb)
  }
  function clearListeners() {
    _cbs.clear()
  }
}

export const createMapEvent = (selector: EventSelector) => {
  const _cbs: Map<Function, any[]> = new Map()

  return {
    addListener,
    hasListener,
    hasListeners,
    callListeners,
    clearListeners,
    removeListener,
    getEvent() {
      return {
        addListener,
        hasListener,
        hasListeners,
        removeListener,
      }
    },
  }

  function addListener(cb: Function, ...options: any) {
    _cbs.set(cb, options)
  }
  function hasListener(cb: Function) {
    return _cbs.has(cb)
  }
  function hasListeners() {
    return _cbs.size > 0
  }
  function callListeners(...args: any[]) {
    _cbs.forEach((options, cb) => {
      const cbArgs = selector(...options, ...args)

      if (cbArgs) {
        cb(...cbArgs)
      }
    })
  }
  function removeListener(cb: Function) {
    _cbs.delete(cb)
  }
  function clearListeners() {
    _cbs.clear()
  }
}
