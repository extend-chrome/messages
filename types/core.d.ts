/** An object which allows the addition, removal, and invocation of listener functions. */
interface EventIterator<T, N> {
  /**
   * Registers an event listener callback to an event.
   * @param callback Called when an event occurs. The parameters of this function depend on the type of event.
   * The callback parameter should be a function that looks like this:
   * function() {...};
   */
  addListener(callback: T): void
  /**
   * @param callback Listener whose registration status shall be tested.
   */
  hasListener(callback: T): boolean
  hasListeners(): boolean
  /**
   * Deregisters an event listener callback from an event.
   * @param callback Listener that shall be unregistered.
   * The callback parameter should be a function that looks like this:
   * function() {...};
   */
  removeListener(callback: T): void
  /**
   * Calls all listeners with a data argument.
   */
  next: N
}

/**
 * Private API.
 *
 * Use for internal state management.
 */
interface Ports
  extends Map<string | number, chrome.runtime.Port> {
  onConnect: EventIterator<
    (
      name: string | number,
      port: chrome.runtime.Port,
      ports: Ports,
    ) => void,
    (name: string | number, port: chrome.runtime.Port) => void
  >

  onMessage: EventIterator<
    (
      message: JsonifiableMessage,
      port: chrome.runtime.Port,
      ports: Ports,
    ) => void,
    (
      message: JsonifiableMessage,
      port: chrome.runtime.Port,
    ) => void
  >

  self?: chrome.runtime.Port
}

/**
 * Private API.
 *
 * Send a response to a script. Id must match previously received message.
 */
type PrivateRespond = (message: JsonifiableResponse) => void

/**
 * Private API.
 *
 * Send a message to a script. Id should be unique.
 */
type PrivateSend = (message: JsonifiableMessage) => void
