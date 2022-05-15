/**
 * @fileoverview disallow literal string
 * @author edvardchen
 */
'use strict';

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const fs = require('fs');
var rule = require('../../../lib/rules/no-literal-string'),
  RuleTester = require('eslint').RuleTester,
  path = require('path');

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------
// const message = 'disallow literal string';
const errors = 1;

var ruleTester = new RuleTester({
  parser: require.resolve('babel-eslint'),
  parserOptions: { sourceType: 'module', ecmaFeatures: { jsx: true } },
});

function testFile(file) {
  return {
    code: fs.readFileSync(`${__dirname}/fixtures/${file}`, {
      encoding: 'utf8',
    }),
    options: [{ mode: 'all' }],
  };
}

const usual = {
  valid: [
    testFile('valid.jsx'),
    { code: 'const a = "absfoo";<DIV abc="bcd" />' },
    {
      code: 'const a = "absfoo";',
      options: [{ mode: 'all', words: { exclude: ['.*foo.*'] } }],
    },
    {
      code: 'const a = "fooabc";',
      options: [{ mode: 'all', words: { exclude: ['^foo.*'] } }],
    },
    {
      code: 'new Error("hello")',
      options: [
        {
          ignoreCallee: ['Error'],
        },
      ],
    },
    {
      code: 'foo.bar("taa");',
      options: [{ mode: 'all', callees: { exclude: ['foo.+'] } }],
    },
    {
      code: 'var a = {foo: "foo"};',
      options: [{ mode: 'all', 'object-properties': { exclude: ['foo'] } }],
    },
    // JSX
    {
      code: '<DIV foo="bar" />',
      options: [{ mode: 'all', 'jsx-attributes': { exclude: ['foo'] } }],
    },
    {
      code: '<Icon>arrow</Icon>',
      options: [
        {
          'jsx-components': { exclude: ['Icon'] },
        },
      ],
    },
    {
      ...testFile('valid-jsx-text-only.jsx'),
      options: [{ mode: 'jsx-text-only' }],
    },
    {
      code: '<DIV foo="bar1" />',
      options: [
        {
          mode: 'all',
          'jsx-attributes': { exclude: ['foo'] },
        },
      ],
    },
    {
      code: '<DIV foo="bar2" />',
      options: [{ mode: 'all', 'jsx-attributes': { include: ['bar'] } }],
    },
    {
      code: `import(\`hello\`);
                var a = \`12345\`
                var a = \`\`
          `,
      options: [
        {
          mode: 'all',
          validateTemplate: true,
        },
      ],
    },
  ],

  invalid: [
    { ...testFile('invalid.jsx'), errors: 13 },
    {
      code: 'var a = `hello ${abc} world`',
      options: [
        {
          validateTemplate: true,
          mode: 'all',
        },
      ],
      errors,
    },
    {
      code: 'var a = `hello world`',
      options: [
        {
          mode: 'all',
          validateTemplate: true,
        },
      ],
      errors,
    },
    {
      code: 'const a = "afoo";',
      options: [
        {
          mode: 'all',
          words: { exclude: ['^foo'] },
        },
      ],
      errors,
    },
    {
      code: 'export const a = "hello_string";',
      options: [{ message: 'Some error message' }],
      errors: [{ message: 'Some error message' }],
    },
  ],
};

const jsx = {
  valid: [
    { code: '<div className="primary"></div>' },
    { code: '<div className={a ? "active": "inactive"}></div>' },
    { code: '<div>{i18next.t("foo")}</div>' },
    { code: '<svg viewBox="0 0 20 40"></svg>' },
    { code: '<line x1="0" y1="0" x2="10" y2="20" />' },
    { code: '<path d="M10 10" />' },
    {
      code:
        '<circle width="16px" height="16px" cx="10" cy="10" r="2" fill="red" />',
    },
    {
      code:
        '<a href="https://google.com" target="_blank" rel="noreferrer noopener"></a>',
    },
    {
      code: '<div id="some-id" tabIndex="0" aria-labelledby="label-id"></div>',
    },
    { code: '<div role="button"></div>' },
    { code: '<img src="./image.png" />' },
    { code: '<A style="bar" />' },
    { code: '<button type="button" for="form-id" />' },
    { code: '<DIV foo="bar" />', options: [{ ignoreAttribute: ['foo'] }] },
    { code: '<Trans>foo</Trans>' },
    { code: '<Trans><span>bar</span></Trans>' },
    { code: '<Trans>foo</Trans>', options: [{ ignoreComponent: ['Icon'] }] },
    { code: '<Icon>arrow</Icon>', options: [{ ignoreComponent: ['Icon'] }] },
    { code: '<div>{import("abc")}</div>', options: [{ markupOnly: true }] },
    {
      code: '<div>{[].map(item=>"abc")}</div>',
      options: [{ markupOnly: true }],
    },
    { code: '<div>{"hello" + "world"}</div>', options: [{ markupOnly: true }] },
    { code: '<DIV foo="FOO" />', options: [{ markupOnly: true }] },
    {
      code: '<DIV foo="bar" />',
      options: [{ markupOnly: true, ignoreAttribute: ['foo'] }],
    },
    { code: '<DIV foo="bar" />', options: [{ onlyAttribute: ['bar'] }] },
  ],
  invalid: [
    {
      ...testFile('invalid-jsx-only.jsx'),
      options: [{ mode: 'jsx-only' }],
      errors: 5,
    },
    {
      code: '<div>{"hello world"}</div>',
      options: [{ markupOnly: true, message: 'Some error message' }],
      errors: [{ message: 'Some error message' }],
    },
  ],
};
ruleTester.run('no-literal-string', rule, usual);
ruleTester.run('no-literal-string', rule, jsx);

//
// ─── VUE ────────────────────────────────────────────────────────────────────────
//

const vueTester = new RuleTester({
  parser: require.resolve('vue-eslint-parser'),
  parserOptions: {
    sourceType: 'module',
  },
});

vueTester.run('no-literal-string', rule, {
  valid: [{ code: '<template>{{ i18next.t("abc") }}</template>' }],
  invalid: [
    {
      code: '<template>{{ a("abc") }}</template>',
      options: [{ mode: 'all' }],
      errors,
    },
    {
      code: '<template>abc</template>',
      errors,
    },
    {
      code: '<template>{{"hello"}}</template>',
      options: [{ mode: 'all' }],
      errors,
    },
  ],
});
// ────────────────────────────────────────────────────────────────────────────────

//
// ─── TYPESCRIPT ─────────────────────────────────────────────────────────────────
//

const tsTester = new RuleTester({
  parser: require.resolve('@typescript-eslint/parser'),
  parserOptions: {
    sourceType: 'module',
    project: path.resolve(__dirname, 'tsconfig.json'),
  },
});

tsTester.run('no-literal-string', rule, usual);
tsTester.run(
  'no-literal-string',
  rule,
  Object.entries(jsx).reduce(
    (prev, [key, value]) => ({
      ...prev,
      [key]: value.map(item => ({
        ...item,
        filename: 'a.jsx',
      })),
    }),
    {}
  )
);

tsTester.run('no-literal-string', rule, {
  valid: [
    {
      code: `declare module 'country-emoji' {}`,
    },
    { code: '<div className="hello"></div>', filename: 'a.tsx' },
    { code: "var a: Element['nodeName']" },
    { code: "var a: Omit<T, 'af'>" },
    { code: "function Button({ t= 'name'  }: {t: string}){} " },
    { code: "enum T  {howard=1, 'a b'=2} ; var a = T['howard']" },
    { code: "function Button({ t= 'name'  }: {t: 'name'}){} " },
    { code: "type T ={t?:'name'|'abc'};function Button({t='name'}:T){}" },
  ],
  invalid: [
    {
      code: '<>foo123</>',
      filename: 'a.tsx',
      errors,
    },
    {
      code: '<>foo999</>',
      filename: 'a.tsx',
      options: [{ markupOnly: true, message: 'Some error message' }],
      errors: [{ message: 'Some error message' }],
    },
    {
      code: `<button className={styles.btn}>loading</button>`,
      filename: 'a.tsx',
      errors,
    },
    {
      code: "var a: {type: string} = {type: 'bb'}",
      options: [{ mode: 'all' }],
      errors,
    },
  ],
});
// ────────────────────────────────────────────────────────────────────────────────
