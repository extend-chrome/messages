import path from 'path'
import delay from 'delay'

import pptr, { Browser, Target, Page } from 'puppeteer'

import * as tests from './extension-src/tests'

import { buildExtension } from './extension-setup'
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

  await delay(500)

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
  optionsTarget = await browser.waitForTarget((t: Target) =>
    t.url().endsWith('options.html'),
  )

  await delay(500)

  backgroundPage = await backgroundTarget.page()
  optionsPage = await optionsTarget.page()
})

afterAll(async () => {
  await browser.close()
})

test.todo('')
