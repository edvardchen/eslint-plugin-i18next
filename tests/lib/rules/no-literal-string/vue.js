const RuleTester = require('eslint').RuleTester;
const rule = require('../../../../lib/rules/no-literal-string');

const vueTester = new RuleTester({
  parser: require.resolve('vue-eslint-parser'),
  parserOptions: {
    sourceType: 'module',
  },
});

vueTester.run('no-literal-string: vue', rule, {
  valid: [
    {
      code: '<template>{{ i18next.t("abc") }}</template>',
      options: [{ mode: 'all' }],
    },
  ],
  invalid: [
    {
      code: '<template>{{ a("abc") }}</template>',
      options: [{ mode: 'all' }],
      errors: 1,
    },
    {
      code: '<template>abc</template>',
      errors: 1,
    },
    {
      code: '<template>{{"hello"}}</template>',
      options: [{ mode: 'all' }],
      errors: 1,
    },
  ],
});
