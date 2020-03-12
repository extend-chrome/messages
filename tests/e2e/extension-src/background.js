import * as tests from './tests'
import chromep from 'chrome-promise'

Object.assign(window, { tests })

chromep.runtime.openOptionsPage()
chromep.tabs.create({ url: tests.contentUrl }).then((tab) => {
  window.newTab = tab
})
