import * as chrome from 'sinon-chrome'

var ChromePromise = require('chrome-promise/constructor')
var chromep = new ChromePromise({ chrome })
;(<any>window).chrome = chrome
;(<any>window).chromep = chromep

// Jest's jsdom does not include window.crypto
var nodeCrypto = require('crypto')
;(<any>window).crypto = {
  getRandomValues: function(buffer: Uint8Array) {
    return nodeCrypto.randomFillSync(buffer)
  },
}
