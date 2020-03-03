/* eslint-env node */

import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
import typescript from '@rollup/plugin-typescript'
import path from 'path'
import { chromeExtension } from 'rollup-plugin-chrome-extension'

const plugins = [
  chromeExtension({ verbose: false }),
  typescript(),
  resolve(),
  commonjs(),
]

export default {
  input: path.join(__dirname, 'manifest.json'),
  output: {
    format: 'esm',
    sourcemap: 'inline',
    dir: path.join(__dirname, '..', 'extension-build'),
  },
  plugins,
}
