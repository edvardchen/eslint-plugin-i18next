const testFile = require('../../helpers/testFile');
const runTest = require('../../helpers/runTest');

const options = [{ mode: 'all', 'should-validate-template': true }];
const cases = {
  valid: [
    {
      code: '<DIV foo="bar" />',
      options: [{ mode: 'jsx-only', 'jsx-attributes': { exclude: ['foo'] } }],
    },
    {
      code: '<DIV foo="bar2" />',
      options: [{ mode: 'all', 'jsx-attributes': { include: ['bar'] } }],
    },
  ],
  invalid: [
    {
      code: '<DIV foo="bar" />',
      options: [{ mode: 'jsx-only', 'jsx-attributes': { include: ['foo'] } }],
      errors: 1,
    },
  ],
};

runTest('no-literal-string: jsx-attributes', cases);
