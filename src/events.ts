/**
 * Add a listener for messages sent using `messages.send`.
 *
 * The optional frameName may be used to designate a custom name for that listener.
 * Use this frameName as the second argument in `messages.send`.
 *
 * The event listener receives two parameters, the message and the `sendResponse` function.
 * The promise returned by `messages.send` will resolve once `sendResponse` has been called.
 *
 * To avoid memory leaks, `sendResponse` should always be called, even if there is no data to send back.
 */
export const on: AddListener = (listener, frameName) => {}

/**
 * Add a listener for messages sent using `messages.onlySend`.
 *
 * The optional frameName may be used to designate a custom name for that listener.
 * Use this frameName as the second argument in `messages.onlySend`.
 *
 * The event listener receives one argument, the message.
 */
export const onlyOn: AddListener = (listener, frameName) => {}

/**
 * Remove a listener for messages sent using `messages.send`.
 *
 * All pending `sendResponse` callbacks will be invalidated.
 */
export const off: RemoveListener = (listener) => {}

/**
 * Remove a listener for messages sent using `messages.onlySend`.
 */
export const onlyOff: RemoveListener = (listener) => {}
