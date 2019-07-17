import path from 'path'
import pptr, { Browser, Target, Page } from 'puppeteer'

import * as tests from './extension-src/tests'

import { buildExtension } from './build-extension'
const { options } = require('./extension-src/rollup.config')

let browser: Browser
let backgroundTarget: Target
let optionsTarget: Target
let backgroundPage: Page
let optionsPage: Page

const pathToExtension = path.join(__dirname, 'extension-build')
options.output.dir = pathToExtension

beforeAll(async () => {
  await buildExtension(options)
})

beforeEach(async () => {
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

afterEach(async () => {
  await browser.close()
})

describe('simple api', () => {
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
      backgroundPage.evaluate(
        (r) => tests.testAsyncOn(r),
        response,
      ),
      optionsPage.evaluate(
        (m) => tests.testAsyncSend(m),
        message,
      ),
    ])

    expect(bgResult).toEqual(message)
    expect(opResult).toEqual(response)
  })
})

describe('chrome api', () => {
  test('send one-way targeted message', async () => {
    const message = { greeting: 'message' }
    const options = { target: 'background' }

    const [bgResult, opResult] = await Promise.all([
      backgroundPage.evaluate(
        (o) => tests.testOnMessage(o),
        options,
      ),
      optionsPage.evaluate(
        (m, o) => tests.testSendMessage(m, o),
        message,
        options,
      ),
    ])

    expect(bgResult).toEqual(message)
    expect(opResult).toBeUndefined()
  })

  test('send async targeted message', async () => {
    const message = { greeting: 'message' }
    const response = { greeting: 'response' }
    const options = { target: 'background', async: true }

    const [bgResult, opResult] = await Promise.all([
      backgroundPage.evaluate(
        (r, o) => tests.testAsyncOnMessage(r, o),
        response,
        options,
      ),
      optionsPage.evaluate(
        (m, o) => tests.testAsyncSendMessage(m, o),
        message,
        options,
      ),
    ])

    expect(bgResult).toEqual(message)
    expect(opResult).toEqual(response)
  })
})
