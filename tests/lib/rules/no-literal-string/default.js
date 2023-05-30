const testFile = require('../../helpers/testFile');
const runTest = require('../../helpers/runTest');

const cases = {
  valid: [{ code: 'const a = "absfoo";<DIV abc="bcd" />' }],
  invalid: [{ ...testFile('invalid.jsx'), errors: 14 }],
};

runTest('no-literal-string: default', cases);
