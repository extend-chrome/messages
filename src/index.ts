import * as events from './events'
import { send, onlySend } from './send'
import { startConnections } from './connect'

startConnections()

const onMessage = events.onMessage.getEvent()
const onOnlyMessage = events.onOnlyMessage.getEvent()

export const messages = {
  send,
  onlySend,
  onMessage,
  onOnlyMessage,
}

export { frameName } from './frames'
export { ports } from './ports'
