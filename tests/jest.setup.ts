import * as chrome from 'sinon-chrome'
import { Port, Tab } from './port.setup'

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

var nodeCrypto = require('crypto')
;(<any>window).crypto = {
  getRandomValues: function(buffer: Uint8Array) {
    return nodeCrypto.randomFillSync(buffer)
  },
}

export { chrome, chromep, Port, Tab }
;(<any>window).chrome = chrome
;(<any>window).chromep = chromep
