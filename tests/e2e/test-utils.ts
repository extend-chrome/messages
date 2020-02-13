export function onMessage(response: any) {
  return new Promise((resolve) => {
    chrome.runtime.onMessage.addListener(
      (message, sender, sendResponse) => {
        sendResponse(response)
        resolve(message)
        return true
      },
    )
  })
}

export function sendMessage(message: any) {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(message, (response) => {
      resolve(response)
    })
  })
}
