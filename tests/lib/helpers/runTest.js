const RuleTester = require('eslint').RuleTester;
const rule = require('../../../lib/rules/no-literal-string');
const babelParser = require('@babel/eslint-parser');

var ruleTester = new RuleTester({
  languageOptions: {
    parser: babelParser,
    sourceType: 'module',
    ecmaVersion: 2022,
    parserOptions: {
      requireConfigFile: false,
      babelOptions: {
        plugins: ['@babel/plugin-syntax-jsx'],
      },
    },
  },
});

module.exports = function runText(name, cases) {
  ruleTester.run(name, rule, cases);
};
