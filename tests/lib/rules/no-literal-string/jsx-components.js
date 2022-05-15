const testFile = require('../../helpers/testFile');
const runTest = require('../../helpers/runTest');

const cases = {
  valid: [
    { code: '<Trans>arrow</Trans>' },
    {
      code: '<Icon>arrow</Icon>',
      options: [{ 'jsx-components': { exclude: ['Icon'] } }],
    },
    {
      code: '<><span>hello</span><p>{i18next.t("KEY")}</p></>',
      options: [{ 'jsx-components': { include: ['p'] } }],
    },
  ],
  invalid: [
    {
      code: '<><span>hello<span><p>world</p></>',
      options: [{ 'jsx-components': { include: ['span'] } }],
      errors: 1,
    },
  ],
};

runTest('no-literal-string: jsx-components', cases);
