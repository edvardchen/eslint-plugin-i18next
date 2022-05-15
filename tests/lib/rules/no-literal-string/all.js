const testFile = require('../../helpers/testFile');
const runTest = require('../../helpers/runTest');

const cases = {
  valid: [testFile('valid.jsx')],
  invalid: [{ ...testFile('invalid.jsx'), errors: 13 }],
};

runTest('no-literal-string: mode all', cases);
