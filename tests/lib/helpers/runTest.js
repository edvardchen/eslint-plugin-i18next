const RuleTester = require('eslint').RuleTester;
const rule = require('../../../lib/rules/no-literal-string');

var ruleTester = new RuleTester({
  parser: require.resolve('babel-eslint'),
  parserOptions: { sourceType: 'module', ecmaFeatures: { jsx: true } },
});

module.exports = function runText(name, cases) {
  ruleTester.run(name, rule, cases);
};
