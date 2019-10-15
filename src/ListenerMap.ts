import {
  MessageListener,
  AsyncMessageListener,
  CoreListener,
} from './types'

type ListenerMap = Map<
  MessageListener | AsyncMessageListener,
  CoreListener
>

export const _listeners = new Map<string, ListenerMap>()

export const _removeListener = (
  scope: string,
  callback: MessageListener | AsyncMessageListener,
) => {
  const _callbacks = _listeners.get(scope)

  if (_callbacks) {
    _callbacks.delete(callback)
  }
}

export const _getListener = (
  scope: string,
  callback: MessageListener | AsyncMessageListener,
): CoreListener | void => {
  const _callbacks = _listeners.get(scope)

  if (_callbacks) {
    return _callbacks.get(callback)
  }
}

export const _setListener = (
  scope: string,
  callback: MessageListener | AsyncMessageListener,
  listener: CoreListener,
) => {
  const _callbacks =
    _listeners.get(scope) || (new Map() as ListenerMap)

  _callbacks.set(callback, listener)

  if (!_listeners.has(scope)) {
    _listeners.set(scope, _callbacks)
  }
}
