import globals from 'globals';
import pluginJs from '@eslint/js';
import i18next from 'eslint-plugin-i18next';

export default [
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
  {
    plugins: { i18next },
    rules: {
      'i18next/no-literal-string': ['error', { mode: 'all' }],
    },
  },
];
