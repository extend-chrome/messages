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
 * An object which allows two way communication with other pages.
 */
type Port = chrome.runtime.Port

/**
 * The extension frame name or content script tab id.
 */
type PortName = string | number

/**
 * Private API.
 *
 * Use for internal state management.
 * Similar to a Map, but where Map would use a Map, Ports uses a Ports object.
 */
interface Ports {
  /**
   * Get a port by its name
   */
  get: (key: PortName) => Port | undefined
  /**
   * Set a port by its name
   */
  set: (key: PortName, port: Port) => Ports
  /**
   * Remove a port by its name
   */
  delete: (key: PortName) => boolean
  /**
   * Remove all ports
   */
  clear: () => void
  /**
   * Iterate over each port
   */
  forEach: (
    callback: (port: Port, key: PortName, ports: Ports) => void,
  ) => void

  has: (key: PortName) => boolean
  entries: () => IterableIterator<[PortName, Port]>
  keys: () => IterableIterator<PortName>
  values: () => IterableIterator<Port>

  /**
   * Event that fires when a port is added
   */
  onConnect: EventIterator<
    (name: PortName, port: Port, ports: Ports) => void,
    (name: PortName, port: Port) => void
  >
  /**
   * Event that fires when a port receives a message
   */
  onMessage: EventIterator<
    (
      message: JsonifiableMessage,
      port: Port,
      ports: Ports,
    ) => void,
    (message: JsonifiableMessage, port: Port) => void
  >

  /**
   * Return value of chrome.runtime.connect
   */
  self?: Port
  size: number
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
