import { join } from 'path'
import { OutputOptions, rollup, RollupOptions } from 'rollup'

export const buildExtension = async (options: RollupOptions) => {
  /* ----------- bundle new extension ----------- */
  if (!options.output)
    throw new TypeError('Rollup options is missing output config')

  const bundle = await rollup(options)
  await bundle.write(options.output as OutputOptions)
}

export const pathToExtension = join(__dirname, 'extension-build')
