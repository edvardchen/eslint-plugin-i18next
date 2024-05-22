const testFile = require('../../helpers/testFile');
const runTest = require('../../helpers/runTest');
const cases = {
  valid: [
    {
      code: '<DIV foo="bar" />',
      options: [{ mode: 'jsx-only', 'jsx-attributes': { exclude: ['foo'] } }],
    },
    {
      code: `<div>{[].map((a) => { switch (a) { case 'abc': return null; default: return null; } })}</div>`,
      options: [{ mode: 'jsx-only' }],
    },
    {
      code: `<div>{[].map((a) => { return <DIV foo={a} />; })}</div>`,
      options: [{ mode: 'jsx-only' }],
    },
    {
      code: `<div>{[].map((a) => { const x="some text"; console.log(x); return <DIV foo={a} />; })}</div>`,
      options: [{ mode: 'jsx-only' }],
    },
  ],
  invalid: [
    {
      code: `<div>{[].map(() => { const x="some text"; console.log(x); return <DIV foo="bar">; })}</div>`,
      options: [{ mode: 'jsx-only' }],
      errors: 1,
    },
    {
      code: `<div>{[].map(() => { const x="some text"; console.log(x); return <div>untranslated text</div> })}</div>`,
      options: [{ mode: 'jsx-only' }],
      errors: 1,
    },
    {
      ...testFile('invalid-jsx-only.jsx'),
      options: [{ mode: 'jsx-only' }],
      errors: 5,
    },
  ],
};
runTest('no-literal-string: mode jsx-only', cases);
