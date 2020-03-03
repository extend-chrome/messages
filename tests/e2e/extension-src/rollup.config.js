/* eslint-env node */

import path from 'path'

import { chromeExtension } from 'rollup-plugin-chrome-extension'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import typescript from '@rollup/plugin-typescript'

const plugins = [
  chromeExtension(),
  typescript(),
  resolve(),
  commonjs(),
]

export const options = {
  input: path.join(__dirname, 'manifest.json'),
  output: {
    format: 'esm',
    sourcemap: 'inline',
  },
  plugins,
}
