/* eslint-env node */

import path from 'path'

import chromeExtension from 'rollup-plugin-chrome-extension'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import emptyDir from 'rollup-plugin-empty-dir'
import zip from 'rollup-plugin-zip'
import typescript from 'rollup-plugin-typescript'

const p = (x) => process.env.PRODUCTION && x

const permissions = {
  include: ['**/@bumble/**/*', 'src/**/*'],
}

const plugins = [
  chromeExtension({
    permissions,
  }),
  typescript(),
  resolve(),
  commonjs(),
  emptyDir(),
  p(zip({ dir: 'releases' })),
]

export const options = {
  input: path.join(__dirname, 'manifest.json'),
  output: {
    format: 'esm',
    sourcemap: 'inline',
  },
  plugins,
}
