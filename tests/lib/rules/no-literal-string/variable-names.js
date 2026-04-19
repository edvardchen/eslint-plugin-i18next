const runTest = require('../../helpers/runTest');

const cases = {
  valid: [
    {
      code: 'const foo = "bar";',
      options: [
        {
          mode: 'all',
          'variable-names': {
            include: [],
            exclude: ['foo'],
          },
        },
      ],
    },
    {
      code: 'const bar = { key: "foo" };',
      options: [
        {
          mode: 'all',
          'variable-names': {
            include: ['foo'],
            exclude: [],
          },
        },
      ],
    },
  ],
  invalid: [
    {
      code: 'const foo = "bar";',
      options: [
        {
          mode: 'all',
          'variable-names': {
            include: ['foo'],
            exclude: [],
          },
        },
      ],
      errors: 1,
    },
    {
      code: 'const bar = { key: "foo" };',
      options: [
        {
          mode: 'all',
          'variable-names': {
            include: [],
            exclude: ['foo'],
          },
        },
      ],
      errors: 1,
    },
  ],
};

runTest('no-literal-string: variable-names', cases);
