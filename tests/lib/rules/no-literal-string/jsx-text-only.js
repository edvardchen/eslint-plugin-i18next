const testFile = require('../../helpers/testFile');
const runTest = require('../../helpers/runTest');

const cases = {
  valid: [
    {
      ...testFile('valid-jsx-text-only.jsx'),
      options: [{ mode: 'jsx-text-only' }],
    },
  ],
  invalid: [{ code: '<div>hello</div>', errors: 1 }],
};

runTest('no-literal-string: mode jsx-text-only', cases);
