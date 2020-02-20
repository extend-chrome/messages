test('chrome is mocked', () => {
  expect(chrome).toBeDefined()
  expect(window.chrome).toBeDefined()

  expect(chrome.runtime.getManifest).not.toBeCalled()
  expect(chrome.runtime.onInstalled.addListener).toBeInstanceOf(Function)
})
