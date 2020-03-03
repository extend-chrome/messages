import delay from 'delay'
import { Browser, launch, Page, Target } from 'puppeteer'
import { pathToExtension } from './extension-setup'
import { onMessage, sendMessage } from './test-utils'

let browser: Browser | undefined
let backgroundTarget: Target
let optionsTarget: Target
let backgroundPage: Page
let optionsPage: Page

beforeAll(async () => {
  browser = await launch({
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
  optionsTarget = await browser.waitForTarget((t: Target) =>
    t.url().endsWith('options.html'),
  )

  await delay(500)

  backgroundPage = await backgroundTarget.page()
  optionsPage = await optionsTarget.page()
}, 30000)

afterAll(async () => {
  await browser?.close()
})

describe('chrome.runtime', () => {
  test('basic runtime messaging', async () => {
    const message = { greeting: 'message' }
    const response = { greeting: 'response' }

    const results = await Promise.all([
      backgroundPage.evaluate(onMessage, response),
      optionsPage.evaluate(sendMessage, message),
    ])

    expect(results[0]).toEqual(message)
    expect(results[1]).toEqual(response)
  })

  test.todo('multiple listeners, one response')
  test.todo('multiple listeners, no response')
  test.todo('multiple listeners, two responses')
})

describe('chrome.tabs', () => {
  test.todo('basic messaging')
  test.todo('multiple listeners, one response')
  test.todo('multiple listeners, no response')
  test.todo('multiple listeners, two responses')
})
