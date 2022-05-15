const RuleTester = require('eslint').RuleTester;
const path = require('path');
const rule = require('../../../../lib/rules/no-literal-string');

const tsTester = new RuleTester({
  parser: require.resolve('@typescript-eslint/parser'),
  parserOptions: {
    sourceType: 'module',
    project: path.resolve(__dirname, 'tsconfig.json'),
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
      code: `declare module 'country-emoji' {}`,
    },
    {
      code: '<div className="hello"></div>',
      filename: 'a.tsx',
    },
    { code: "var a: Element['nodeName']" },
    { code: "var a: Omit<T, 'af'>" },
    { code: "function Button({ t= 'name'  }: {t: string}){} " },
    { code: `var a: 'abc' = 'abc'` },
    { code: `var a: 'abc' | 'name'  | undefined= 'abc'` },
    { code: "type T = {name: 'b'} ; var a: T =  {name: 'b'}" },
    { code: "enum T  {howard=1, 'a b'=2} ; var a = T['howard']" },
    { code: "function Button({ t= 'name'  }: {t: 'name'}){} " },
    { code: "type T ={t?:'name'|'abc'};function Button({t='name'}:T){}" },
  ],
  invalid: [
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
// ────────────────────────────────────────────────────────────────────────────────
