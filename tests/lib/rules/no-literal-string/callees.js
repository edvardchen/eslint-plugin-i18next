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
    {
      // multi-line chained calls must still match callee patterns
      // https://github.com/edvardchen/eslint-plugin-i18next/issues/162
      code: 'msg\n  .toLowerCase()\n  .includes("unmapped");',
      options: [{ mode: 'all', callees: { exclude: ['includes'] } }],
    },
  ],
  invalid: [{ ...testFile('invalid.jsx'), errors: 15 }],
};

runTest('no-literal-string: callees', cases);
