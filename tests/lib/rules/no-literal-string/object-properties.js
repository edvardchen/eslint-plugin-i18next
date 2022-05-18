const runTest = require('../../helpers/runTest');

const cases = {
  valid: [
    {
      code: 'HomePage.displayName = "HomePage";',
      options: [
        {
          mode: 'all',
          'object-properties': {
            include: [],
            exclude: ['displayName'],
          },
        },
      ],
    },
    {
      code: 'var a = {foo: "foo"};',
      options: [{ mode: 'all', 'object-properties': { exclude: ['foo'] } }],
    },
  ],
  invalid: [],
};

runTest('no-literal-string: object-properties', cases);
