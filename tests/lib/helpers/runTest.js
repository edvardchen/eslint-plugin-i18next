const RuleTester = require('eslint').RuleTester;
const rule = require('../../../lib/rules/no-literal-string');

var ruleTester = new RuleTester({
  languageOptions: {
    sourceType: 'module',
    ecmaVersion: 2022,
    parserOptions: {
      ecmaFeatures: {
        jsx: true,
      },
    },
  },
});

module.exports = function runText(name, cases) {
  ruleTester.run(name, rule, cases);
};
