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

ruleTester.run('no-literal-string', rule, {
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
    // JSX
    {
      ...testFile('invalid-jsx-only.jsx'),
      options: [{ mode: 'jsx-only' }],
      errors: 5,
    },
  ],
});

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

tsTester.run('no-literal-string', rule, {
  valid: [
    {
      code: `declare module 'country-emoji' {}`,
    },
    { code: '<div className="hello"></div>', filename: 'a.tsx' },
    { code: "var a: Element['nodeName']" },
    { code: "var a: Omit<T, 'af'>" },
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
      errors,
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
