// @ts-check
// TODO: eslint typescript support is still in experimental stage
import typescriptEslint from 'typescript-eslint'

import ts from '@typescript-eslint/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
import prettierConfig from 'eslint-config-prettier'
import prettierRecommended from 'eslint-plugin-prettier/recommended'
import globals from 'globals'

export default typescriptEslint.config(
  {
    ignores: ['**/node_modules/**', '**/dist/**', '**/.vscode/**']
  },

  // typescript-specific rules
  {
    name: 'typescript-rules',
    files: ['**/*.ts', '**/*.tsx', '**/*.mts'],
    languageOptions: {
      ecmaVersion: 'latest',
      globals: {
        ...globals.node
      },
      parser: tsParser
    },
    plugins: { '@typescript-eslint': ts },
    rules: {
      ...ts.configs.recommended.rules,
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports'
        }
      ]
    }
  },

  // general recommendations
  prettierConfig,
  prettierRecommended // prettier last to avoid clash with autoformatting
)
