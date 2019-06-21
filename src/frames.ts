const { background = {}, options_page = null, options_ui = {} } =
  chrome && chrome.runtime ? chrome.runtime.getManifest() : {}

const pathname = location.pathname.slice(1)

export const isExtensionFrame = (): boolean =>
  location.protocol === 'chrome-extension:'

export const isContentScript = (): boolean =>
  !isExtensionFrame() &&
  chrome &&
  chrome.runtime &&
  !chrome.runtime.getBackgroundPage

export const isBackgroundPage = (): boolean =>
  isExtensionFrame() &&
  (pathname === '_generated_background_page.html' ||
    pathname === background.page)

export const isOptionsPage = (): boolean =>
  isExtensionFrame() &&
  (pathname === options_page || pathname === options_ui.page)

export const isPopupPage = (): boolean =>
  isExtensionFrame() && !isBackgroundPage() && !isOptionsPage()

export const getFrameName = (): string => {
  switch (true) {
    case isContentScript():
      return 'content'
    case isBackgroundPage():
      return 'background'
    case isOptionsPage():
      return 'options'
    case isPopupPage():
      return 'popup'
    default: {
      console.warn('Unable to derive frame name.')
      return ''
    }
  }
}
