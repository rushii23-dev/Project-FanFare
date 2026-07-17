import js from '@eslint/js'
import reactHooks from 'eslint-plugin-react-hooks'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import globals from 'globals'

export default [
  { ignores: ['dist/', 'node_modules/', 'coverage/'] },

  js.configs.recommended,

  {
    files: ['**/*.{js,mjs,jsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: { ecmaFeatures: { jsx: true } },
      globals: { ...globals.browser, ...globals.node },
    },
    rules: {
      // JSX usage counts — without this every component import is "unused".
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]', argsIgnorePattern: '^_' }],

      // Correctness rules beyond the recommended set.
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      'no-var': 'error',
      'prefer-const': 'error',
      'no-implicit-coercion': 'error',
      'no-else-return': 'error',
      'no-lonely-if': 'error',
      'no-useless-return': 'error',
      'no-template-curly-in-string': 'error',
      'no-shadow': 'error',
      'no-unneeded-ternary': 'error',
      'object-shorthand': 'error',
      'prefer-template': 'error',
      'no-duplicate-imports': 'error',
      'prefer-object-spread': 'error',
      'no-useless-concat': 'error',
      'no-useless-rename': 'error',
      'no-multi-assign': 'error',
      'default-case-last': 'error',
      // console.warn/error are legitimate operational signals; console.log
      // left behind from debugging is not.
      'no-console': ['error', { allow: ['warn', 'error'] }],
    },
  },

  // CLI scripts report through stdout — console.log IS their output channel.
  {
    files: ['scripts/**'],
    rules: { 'no-console': 'off' },
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

  // Static accessibility analysis on every component: the axe gate catches
  // rendered-DOM violations on the screens it visits; this catches ARIA and
  // interaction-pattern mistakes in ANY component at lint time, including
  // states the browser gate never reaches.
  {
    files: ['src/**/*.jsx'],
    plugins: { 'jsx-a11y': jsxA11y },
    rules: {
      ...jsxA11y.flatConfigs.recommended.rules,
    },
  },
]
