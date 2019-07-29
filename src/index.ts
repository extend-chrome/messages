import delay from 'delay'

/**
 * Export anyFunction
 */
export const anyFunction = delay(500).then(() => 'delayed')
