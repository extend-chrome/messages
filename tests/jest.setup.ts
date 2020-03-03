import { chrome } from '@bumble/jest-chrome'
import { removeSync } from 'fs-extra'
import { pathToExtension } from './e2e/extension-setup'

// Setup jest-chrome
Object.assign(window, { chrome })

// Remove a previously built extension
removeSync(pathToExtension)
