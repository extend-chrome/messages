/**
 * Private API.
 *
 * Use for internal state management.
 */
interface Ports {
  [targetName: string]: chrome.runtime.Port
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
