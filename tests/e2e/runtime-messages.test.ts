import path from 'path'
import pptr, { Browser, Target, Page } from 'puppeteer'

import { buildExtension } from './build-extension'

const { options } = require('./extension-src/rollup.config')
const pathToExtension = path.join(__dirname, 'extension-build')
options.output.dir = pathToExtension

let browser: Browser
let backgroundTarget: Target
let optionsTarget: Target
let backgroundPage: Page
let optionsPage: Page

beforeAll(async () => {
  await buildExtension(options)

  browser = await pptr.launch({
    headless: false,
    args: [
      '--disable-component-extensions-with-background-pages',
      `--disable-extensions-except=${pathToExtension}`,
      `--load-extension=${pathToExtension}`,
    ],
  })

  backgroundTarget = await browser.waitForTarget(
    (t: Target) => t.type() === 'background_page',
  )
  backgroundPage = await backgroundTarget.page()

  optionsTarget = await browser.waitForTarget((t: Target) =>
    t.url().endsWith('options.html'),
  )
  optionsPage = await optionsTarget.page()
})

afterAll(async () => {
  await browser.close()
})

describe('chrome.runtime', () => {
  test('sendMessage and onMessage', async () => {
    const message = { greeting: 'message' }
    const response = { greeting: 'response' }

    const results = await Promise.all([
      backgroundPage.evaluate(onMessage, response),
      optionsPage.evaluate(sendMessage, message),
    ])

    expect(results[0]).toEqual(message)
    expect(results[1]).toEqual(response)
  })
})

function onMessage(response: any) {
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

function sendMessage(message: any) {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(message, (response) => {
      resolve(response)
    })
  })
}
