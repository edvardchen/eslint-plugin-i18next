const testFile = require('../../helpers/testFile');
const runTest = require('../../helpers/runTest');

const cases = {
  valid: [
    {
      code: 'const a = "absfoo";',
      options: [{ mode: 'all', words: { exclude: ['.*foo.*'] } }],
    },
    {
      code: 'const a = "fooabc";',
      options: [{ mode: 'all', words: { exclude: ['^foo.*'] } }],
    },
  ],
  invalid: [
    {
      code: 'const a = "afoo";',
      options: [{ mode: 'all', words: { exclude: ['^foo'] } }],
      errors: 1,
    },
  ],
};

runTest('no-literal-string: words', cases);
