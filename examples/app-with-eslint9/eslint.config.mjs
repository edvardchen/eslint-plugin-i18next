import globals from 'globals';
import pluginJs from '@eslint/js';
import i18next from 'eslint-plugin-i18next';

export default [
  {
    languageOptions: { globals: globals.browser },
    linterOptions: { reportUnusedDisableDirectives: 'error' },
  },
  pluginJs.configs.recommended,
  i18next.configs['flat/recommended'],
  {
    rules: { 'i18next/no-literal-string': ['error', { mode: 'all' }] },
  },
];
