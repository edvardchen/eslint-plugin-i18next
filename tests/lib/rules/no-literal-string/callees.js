const testFile = require('../../helpers/testFile');
const runTest = require('../../helpers/runTest');

const cases = {
  valid: [
    {
      code: 'new Error("hello")',
      options: [{ mode: 'all', callees: { exclude: ['Error'] } }],
    },
    {
      code: 'foo.bar("taa");',
      options: [{ mode: 'all', callees: { exclude: ['foo.+'] } }],
    },
  ],
  invalid: [{ ...testFile('invalid.jsx'), errors: 14 }],
};

runTest('no-literal-string: callees', cases);
