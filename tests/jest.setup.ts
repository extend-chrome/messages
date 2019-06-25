import * as chrome from 'sinon-chrome'

/*
  Mock-implementation of chrome.runtime messaging API
*/
const Port = () => {
  const _listeners = []

  return {
    onMessage: {
      addListener: (cb) => _listeners.push(cb),
    },

    onDisconnect: {
      addListener: (cb) => {},
    },

    postMessage: (data) => {
      _listeners.forEach((cb) => cb.call(this, data))
    },
  }
}

chrome.runtime.connect.returns(Port())

chrome.runtime.id = 'foo123' // Fix for schema.json

// Some time around Chrome 71, extension.sendRequest (and a few others) started
// throwing an error when accessed.  This mimics that behavior.
Object.defineProperty(chrome.extension, 'sendRequest', {
  get: function() {
    throw new Error('Deprecated!')
  },
})

var ChromePromise = require('chrome-promise/constructor')

var chromep = new ChromePromise({ chrome })

export { chrome, chromep }
;(<any>window).chrome = chrome
;(<any>window).chromep = chromep
