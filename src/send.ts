export const send = (
  message: any,
  target?: any,
): Promise<void> =>
  new Promise((resolve, reject) => {
    const coreMessage = {
      async: false,
      target: target || null,
      payload: message,
    }

    const callback = () => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message))
      } else {
        resolve()
      }
    }

    if (typeof target === 'number') {
      chrome.tabs.sendMessage(target, coreMessage, callback)
    } else {
      chrome.runtime.sendMessage(coreMessage, callback)
    }
  })

export const sendAsync = () => {}
