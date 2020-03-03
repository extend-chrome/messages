import delay from 'delay'
import { Browser, launch, Page, Target } from 'puppeteer'
import { buildExtension, pathToExtension } from './extension-setup'
import * as tests from './extension-src/tests'

const { options } = require('./extension-src/rollup.config')
options.output.dir = pathToExtension

let browser: Browser | undefined
let backgroundTarget: Target
let optionsTarget: Target
let backgroundPage: Page
let optionsPage: Page

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

test('send one-way message', async () => {
  const message = { greeting: 'message' }

  const [bgResult, opResult] = await Promise.all([
    backgroundPage.evaluate(() => tests.testOn()),
    optionsPage.evaluate((m) => tests.testSend(m), message),
  ])

  expect(bgResult).toEqual(message)
  expect(opResult).toBeUndefined()
})

test('send async message', async () => {
  const message = { greeting: 'message' }
  const response = { greeting: 'response' }

  const [bgResult, opResult] = await Promise.all([
    backgroundPage.evaluate((r) => tests.testAsyncOn(r), response),
    optionsPage.evaluate((m) => tests.testAsyncSend(m), message),
  ])

  expect(bgResult).toEqual(message)
  expect(opResult).toEqual(response)
})
