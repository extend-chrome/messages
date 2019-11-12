import { useScope } from './scope'

export { useScope }

// Default scope
export const messages = useScope('@bumble/messages__root')
export const { useLine } = messages
