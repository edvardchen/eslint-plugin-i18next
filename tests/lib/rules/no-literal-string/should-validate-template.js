const runTest = require('../../helpers/runTest');

const cases = {
  valid: [
    {
      code: `import(\`hello\`);
	var a = \`12345\`
	var a = \`\`
  `,
      options: [{ mode: 'all', 'should-validate-template': true }],
    },

    {
      code: 'var a = `hello ${abc} world`',
      options: [{ mode: 'jsx-only', 'should-validate-template': true }],
    },

    {
      code: 'const StyledParagaph = styled.p`some css here`',
      options: [
        {
          mode: 'all',
          callees: { exclude: ['styled.*'] },
          'should-validate-template': true,
        },
      ],
    },
  ],
  invalid: [
    {
      code: 'var a = `hello ${abc} world`',
      options: [{ mode: 'all', 'should-validate-template': true }],
      errors: 1,
    },
    {
      code: 'var a = "hello world"; <>`abcd`</>',
      options: [{ mode: 'jsx-only', 'should-validate-template': true }],
      errors: 1,
    },
  ],
};

runTest('no-literal-string: should-validate-template', cases);
