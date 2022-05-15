const testFile = require('../../helpers/testFile');
const runTest = require('../../helpers/runTest');

const options = [{ mode: 'all', 'should-validate-template': true }];
const cases = {
  valid: [
    {
      code: `import(\`hello\`);
	var a = \`12345\`
	var a = \`\`
  `,
      options,
    },
  ],
  invalid: [
    { code: 'var a = `hello ${abc} world`', options, errors: 1 },
    { code: 'var a = `hello world`', options, errors: 1 },
  ],
};

runTest('no-literal-string: should-validate-template', cases);
