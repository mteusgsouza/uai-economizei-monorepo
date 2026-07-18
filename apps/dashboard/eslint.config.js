import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      'no-restricted-syntax': [
        'warn',
        {
          selector: "Literal[value=/flex-shrink-0/]",
          message: 'Use "shrink-0" instead of "flex-shrink-0" (Tailwind shorthand).',
        },
        {
          selector: "Literal[value=/flex-grow-0/]",
          message: 'Use "grow-0" instead of "flex-grow-0" (Tailwind shorthand).',
        },
        {
          selector: "Literal[value=/flex-grow /]",
          message: 'Use "grow" instead of "flex-grow" (Tailwind shorthand).',
        },
        {
          selector: "Literal[value=/\\[var\\(--/]",
          message: 'Use "utility-(--varname)" instead of "utility-[var(--varname)]" (Tailwind v4 syntax).',
        },
      ],
    },
  },
])
