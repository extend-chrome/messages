/* eslint-env node */

import typescript from 'rollup-plugin-typescript2'

export default [
  {
    input: 'src/index.ts',
    output: [
      {
        file: 'build/bumble-messages-esm.js',
        format: 'esm',
        sourcemap: 'inline',
      },
      {
        file: 'build/bumble-messages-cjs.js',
        format: 'cjs',
        sourcemap: 'inline',
      },
    ],
    plugins: [typescript()],
  },
]
