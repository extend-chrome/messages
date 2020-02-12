import { useScope } from './scope'

export { useScope }

// Default scope
export const __defaultScopeName = '@bumble/messages__root'
export const messages = useScope(__defaultScopeName)
export const { useLine } = messages