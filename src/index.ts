import * as events from './events'
export { send, onlySend } from './send'

export const onMessage = events.onMessage.getEvent()
export const onOnlyMessage = events.onOnlyMessage.getEvent()
