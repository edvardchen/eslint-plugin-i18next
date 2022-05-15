const testFile = require('../../helpers/testFile');
const runTest = require('../../helpers/runTest');

const cases = {
  valid: [
    {
      code: 'var a = {foo: "foo"};',
      options: [{ mode: 'all', 'object-properties': { exclude: ['foo'] } }],
    },
  ],
  invalid: [],
};

runTest('no-literal-string: object-properties', cases);
