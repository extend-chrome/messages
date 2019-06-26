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
      const cbArgs = nextSelector(...args)

      _cbs.forEach((cb) => {
        cb(...cbArgs)
      })
    },
    removeListener(cb: Function) {
      _cbs.delete(cb)
    },
  }
}
