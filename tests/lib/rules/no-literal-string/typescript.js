const RuleTester = require('eslint').RuleTester;
const path = require('path');
const rule = require('../../../../lib/rules/no-literal-string');
const testFile = require('../../helpers/testFile');
const tsParser = require('@typescript-eslint/parser');

const tsTester = new RuleTester({
  languageOptions: {
    parser: tsParser,
    sourceType: 'module',
    ecmaVersion: 2022,
  },
});

tsTester.run('no-literal-string: typescript', rule, {
  valid: [
    {
      code: '<Icon>arrow</Icon>',
      options: [{ 'jsx-components': { exclude: ['Icon'] } }],
      filename: 'a.jsx',
    },
    {
      ...testFile('valid-typescript.ts'),
      options: [{ mode: 'all' }],
    },
    {
      code: '<div className="hello"></div>',
      options: [{ mode: 'all' }],
      filename: 'a.tsx',
    },
  ],
  invalid: [
    {
      code: 'let a:string; a="hello"',
      options: [{ mode: 'all' }],
      errors: 1,
    },
    {
      code: 'const a="foobar"',
      options: [{ mode: 'all' }],
      errors: 1,
    },
    {
      code: '<>foo123</>',
      filename: 'a.tsx',
      errors: 1,
    },
    {
      code: '<>foo999</>',
      filename: 'a.tsx',
      options: [{ markupOnly: true, message: 'Some error message' }],
      errors: [{ message: 'Some error message: <>foo999</>' }],
    },
    {
      code: `<button className={styles.btn}>loading</button>`,
      filename: 'a.tsx',
      errors: 1,
    },
    {
      code: "var a: {type: string} = {type: 'bb'}",
      options: [{ mode: 'all' }],
      errors: 1,
    },
  ],
});
