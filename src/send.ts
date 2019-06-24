/**
 * Send a message to another script. Use when you need to get a response.
 *
 * @returns A promise that resolves when the event listener calls `sendResponse`, or rejects when the event listener throws an error.
 * @param message Send any JSON-ifiable data.
 * @param target "background", "options", "popup", or a custom target name as a `string` or a tab id as a `number`.
 */
export const send: SendMessage = (
  message,
  target,
): Promise<any> => {
  return new Promise((resolve, reject) => {})
}

/**
 * Send a message to another script. Use when you don't need a response.
 *
 * @param message Send any JSON-ifiable data.
 * @param target "background", "options", "popup", or a custom target name as a `string` or a tab id as a `number`.
 */
export const onlySend: SendMessage = (
  message,
  target,
): void => {}
