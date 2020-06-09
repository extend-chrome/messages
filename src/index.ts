import { getScope } from './scope'

export { getScope, getScope as useScope }

// Default scope
export const __defaultScopeName = '@extend-chrome/messages__root'
export const messages = getScope(__defaultScopeName)
export const { getMessage } = messages