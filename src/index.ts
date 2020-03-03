import { getScope } from './scope'

export { getScope, getScope as useScope }

// Default scope
export const __defaultScopeName = '@bumble/messages__root'
export const messages = getScope(__defaultScopeName)
export const { useLine } = messages