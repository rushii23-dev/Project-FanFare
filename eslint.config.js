import js from '@eslint/js'
import reactHooks from 'eslint-plugin-react-hooks'
import globals from 'globals'

export default [
  { ignores: ['dist/', 'node_modules/'] },

  js.configs.recommended,

  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: { ecmaFeatures: { jsx: true } },
      globals: { ...globals.browser, ...globals.node },
    },
    rules: {
      // JSX usage counts — without this every component import is "unused".
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]', argsIgnorePattern: '^_' }],
    },
  },

  // The hooks rules that catch real bugs (conditional hooks, stale closures)
  // run as errors. The React-Compiler advisory rules new in plugin v7 are off:
  // they flag the fetch-then-setState pattern our data hooks use to sync
  // external APIs (weather, fixtures, geocoding), which the React docs list as
  // a legitimate effect. Adopting the compiler is the right fix, not rewrites.
  {
    files: ['src/**/*.{js,jsx}'],
    plugins: { 'react-hooks': reactHooks },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'error',
    },
  },
]
