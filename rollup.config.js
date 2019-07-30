/* eslint-env node */

import typescript from 'rollup-plugin-typescript'

export default [
  {
    input: 'src/index.ts',
    output: [
      {
        file: 'lib/index-esm.js',
        format: 'esm',
        sourcemap: 'inline',
      },
      {
        file: 'lib/index-cjs.js',
        format: 'cjs',
        sourcemap: 'inline',
      },
    ],
    plugins: [typescript()],
  },
]
