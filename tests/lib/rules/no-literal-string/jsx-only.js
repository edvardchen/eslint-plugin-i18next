const testFile = require('../../helpers/testFile');
const runTest = require('../../helpers/runTest');
const cases = {
  valid: [
    {
      code: '<DIV foo="bar" />',
      options: [{ mode: 'jsx-only', 'jsx-attributes': { exclude: ['foo'] } }],
    },
    {
      code: `<div>{[].map((a) => { switch (a) { case 'abc': return null; default: return null; } })}</div>`,
      options: [{ mode: 'jsx-only' }],
    },
  ],
  invalid: [
    {
      ...testFile('invalid-jsx-only.jsx'),
      options: [{ mode: 'jsx-only' }],
      errors: 5,
    },
  ],
};
runTest('no-literal-string: mode jsx-only', cases);
