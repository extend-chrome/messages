/* eslint-env node */

import bundle from 'rollup-plugin-bundle-imports'
import typescript from 'rollup-plugin-typescript'

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
    external: ['rxjs'],
    plugins: [typescript(), bundle()],
  },
]
