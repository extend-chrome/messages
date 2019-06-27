/** An object which allows the addition, removal, and invocation of listener functions. */
type CoreEvent<T> = {
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
}

/** An object which allows the addition, removal, and invocation of listener functions. */
type NamedEvent<T> = {
  /**
   * Registers an event listener callback to an event.
   * @param callback Called when an event occurs. The parameters of this function depend on the type of event.
   * The callback parameter should be a function that looks like this:
   * function() {...};
   */
  addListener(callback: T, name: TargetName): void
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
}

type Callable<T, C> = {
  /**
   * Calls all listeners with a data argument.
   */
  callListeners: C

  /**
   * Remove all listeners
   */
  clearListeners(): void

  /**
   * Returns CallableEvent without callListeners
   */
  getEvent(): CoreEvent<T>
}

type CallableEvent<T, C> = CoreEvent<T> & Callable<T, C>
type CallableNamedEvent<T, C> = NamedEvent<T> & Callable<T, C>
