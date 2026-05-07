import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      // This project legitimately hydrates state from localStorage / async loaders in effects.
      // The rule is too strict for the existing code style.
      'react-hooks/set-state-in-effect': 'off',
      // We export hooks/context from non-component files (e.g. AuthContext).
      'react-refresh/only-export-components': 'off',
      // Existing pages intentionally omit some deps to avoid refetch loops.
      'react-hooks/exhaustive-deps': 'off',
    },
  },
])
