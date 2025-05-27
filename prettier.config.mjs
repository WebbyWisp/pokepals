// @ts-check

/**
 * @type {import('prettier').Config}
 */
export default {
  useTabs: false,
  printWidth: 120,
  singleQuote: true,
  tabWidth: 2,
  semi: false,
  endOfLine: 'lf',
  trailingComma: 'none',
  overrides: [
    {
      files: '*.json',
      options: { parser: 'json' }
    },
    {
      files: '*.{yaml,yml}',
      options: {
        singleQuote: false
      }
    }
  ]
}
