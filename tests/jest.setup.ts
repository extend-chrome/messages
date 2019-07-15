import * as chrome from 'sinon-chrome'

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
;(<any>window).chrome = chrome
;(<any>window).chromep = chromep

var nodeCrypto = require('crypto')
;(<any>window).crypto = {
  getRandomValues: function(buffer: Uint8Array) {
    return nodeCrypto.randomFillSync(buffer)
  },
}
