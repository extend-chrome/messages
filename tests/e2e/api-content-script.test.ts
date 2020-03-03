import delay from 'delay'
import { Browser, launch, Page, Target } from 'puppeteer'
import { buildExtension, pathToExtension } from './extension-setup'
import * as tests from './extension-src/tests'

const { options } = require('./extension-src/rollup.config')

let browser: Browser | undefined
let backgroundTarget: Target
let backgroundPage: Page
let contentTarget: Target
let contentPage: Page

options.output.dir = pathToExtension

beforeAll(async () => {
  await buildExtension(options)

  await delay(500)

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
  contentTarget = await browser.waitForTarget(
    (t: Target) => t.url() === tests.contentUrl,
  )

  await delay(500)

  backgroundPage = await backgroundTarget.page()
  contentPage = await contentTarget.page()
}, 30000)

afterAll(async () => {
  await browser?.close()
})

test('send to tab', async () => {
  const message = { greeting: 'message' }

  const ctResults: string[] = []
  contentPage.on('console', (consoleMessage) => {
    ctResults.push(consoleMessage.text())
  })

  const bgResult = await backgroundPage.evaluate(
    (m) => tests.testSendToTab(m),
    message,
  )

  expect(bgResult).toBeUndefined()
  expect(ctResults).toContain(message.greeting)
})

test('async send to tab', async () => {
  const message = { greeting: 'message' }

  const ctResults: string[] = []
  contentPage.on('console', (consoleMessage) => {
    ctResults.push(consoleMessage.text())
  })

  const bgResult = await backgroundPage.evaluate(
    (m) => tests.testAsyncSendToTab(m),
    message,
  )

  expect(bgResult).toEqual(tests.contentResponse)
  expect(ctResults).toContain(message.greeting)
})
