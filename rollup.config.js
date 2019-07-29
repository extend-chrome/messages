/* eslint-env node */

import typescript from 'rollup-plugin-typescript'
import { emptyDir } from 'rollup-plugin-empty-dir'

export default [
  {
    input: 'src/index.ts',
    output: [
      {
        dir: 'lib',
        format: 'esm',
        sourcemap: true,
      },
      {
        dir: 'lib',
        format: 'cjs',
        sourcemap: true,
      },
    ],
    plugins: [typescript(), emptyDir()],
  },
]
