const testFile = require('../../helpers/testFile');
const runTest = require('../../helpers/runTest');

const cases = {
  valid: [testFile('valid.jsx')],
  invalid: [
    { ...testFile('invalid.jsx'), errors: 14 },
    {
      code: `export const validationSchema = Yup.object({
        email: Yup
          .string()
          .email('hello')
          .required('world'),
      })`,
      options: [{ mode: 'all' }],
      errors: 2,
    },
  ],
};

runTest('no-literal-string: mode all', cases);
