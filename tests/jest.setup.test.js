test('chrome is mocked', () => {
  expect(chrome).toBeDefined()

  expect(chrome.runtime).toBeDefined()
  expect(chrome.contextMenus).toBeDefined()
  expect(chrome.storage).toBeDefined()
  expect(chrome.tabs).toBeDefined()
  expect(chrome.webRequest).toBeDefined()
  expect(chrome.proxy).toBeDefined()
  expect(chrome.browserAction).toBeDefined()
  expect(chrome.browserAction.enable()).toBeUndefined()
})

test('chromep to be promisified', () => {
  expect(chromep.runtime.getBackgroundPage()).toBeInstanceOf(
    Promise,
  )

  expect(chromep.notifications.create({})).toBeInstanceOf(
    Promise,
  )
})
