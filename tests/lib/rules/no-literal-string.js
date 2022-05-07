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
const message = 'disallow literal string';
const errors = [{ message }]; // default errors

var ruleTester = new RuleTester({
  parser: require.resolve('babel-eslint'),
  parserOptions: {
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
});
ruleTester.run('no-literal-string', rule, {
  valid: [
    {
      code: fs.readFileSync(__dirname + '/fixtures/valid.js', {
        encoding: 'utf8',
      }),
    },
    {
      code: 'const a = "absfoo";',
      options: [{ words: { exclude: ['.*foo.*'] } }],
    },
    {
      code: 'const a = "fooabc";',
      options: [{ words: { exclude: ['^foo.*'] } }],
    },
    {
      code: 'foo.bar("taa");',
      options: [{ callees: { exclude: ['foo.+'] } }],
    },
    {
      code: 'var a = {foo: "foo"};',
      options: [{ 'object-properties': { exclude: ['foo'] } }],
    },
    // JSX
    {
      code: fs.readFileSync(__dirname + '/fixtures/valid.jsx', {
        encoding: 'utf8',
      }),
    },
    { code: '<DIV foo="bar" />', options: [{ ignoreAttribute: ['foo'] }] },
    { code: '<Trans>foo</Trans>', options: [{ ignoreComponent: ['Icon'] }] },
    { code: '<Icon>arrow</Icon>', options: [{ ignoreComponent: ['Icon'] }] },
    {
      code: `a + "b"
const c = <div>{import("abc")}</div>
const d = <div>{[].map(item=>"abc")}</div>
const e = <div>{"hello" + "world"}</div>
const f = <DIV foo="FOO" />
    `,
      options: [{ markupOnly: true }],
    },
    {
      code: '<DIV foo="bar" />',
      options: [{ markupOnly: true, ignoreAttribute: ['foo'] }],
    },
    // when onlyAttribute was configured, the markOnly would be treated as true
    { code: 'const a = "foo";', options: [{ onlyAttribute: ['bar'] }] },
    { code: '<DIV foo="bar" />', options: [{ onlyAttribute: ['bar'] }] },
    {
      code: `import(\`hello\`);
            var a = \`12345\`
            var a = \`\`
      `,
      options: [{ validateTemplate: true }],
    },
  ],

  invalid: [
    {
      code: fs.readFileSync(__dirname + '/fixtures/invalid.js', {
        encoding: 'utf8',
      }),
      errors: 8,
    },
    {
      code: 'var a = `hello ${abc} world`',
      options: [{ validateTemplate: true }],
      errors,
    },
    {
      code: 'var a = `hello world`',
      options: [{ validateTemplate: true }],
      errors,
    },
    {
      code: 'const a = "afoo";',
      options: [{ words: { exclude: ['^foo'] } }],
      errors,
    },
    {
      code: 'var a = {foo: "foo"};',
      options: [{ ignoreProperty: ['bar'] }],
      errors,
    },
    // JSX
    { code: '<div>foo</div>', errors },
    { code: '<div>foo</div>', options: [{ markupOnly: true }], errors },
    { code: '<>foo999</>', options: [{ markupOnly: true }], errors },
    // { code: '<div>FOO</div>', errors },
    {
      code: '<div>{"hello world"}</div>',
      options: [{ markupOnly: true }],
      errors,
    },
    { code: '<div>フー</div>', errors },
    { code: '<DIV foo="bar" />', errors },
    { code: '<DIV foo="bar" />', options: [{ markupOnly: true }], errors },
    { code: '<DIV foo={"bar"} />', options: [{ markupOnly: true }], errors },
    { code: '<img src="./image.png" alt="some-image" />', errors },
    { code: '<button aria-label="Close" type="button" />', errors },
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
      errors,
    },
    {
      code: '<template>abc</template>',
      errors,
    },
    {
      code: '<template>{{"hello"}}</template>',
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
    { code: `declare module 'country-emoji' {}` },
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
      code: '<>foo999</>',
      filename: 'a.tsx',
      options: [{ markupOnly: true }],
      errors,
    },
    {
      code: `<button className={styles.btn}>loading</button>`,
      filename: 'a.tsx',
      errors,
    },
    { code: "var a: {type: string} = {type: 'bb'}", errors },
  ],
});
// ────────────────────────────────────────────────────────────────────────────────
