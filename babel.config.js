/* eslint-env node */

module.exports = (api) => {
  const isTest = api.env('test')

  if (isTest) {
    return {
      presets: [
        '@babel/preset-typescript',
        [
          '@babel/preset-env',
          {
            targets: {
              chrome: 70,
            },
          },
        ],
      ],
    }
  } else {
    return {
      presets: [
        '@babel/preset-typescript',
        [
          '@babel/env',
          {
            modules: false,
          },
        ],
      ],
    }
  }
}
