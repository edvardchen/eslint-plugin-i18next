/**
 * @fileoverview disallow literal string
 * @author edvardchen
 */
'use strict';

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var rule = require('../../../lib/rules/no-literal-string'),
  RuleTester = require('eslint').RuleTester,
  path = require('path');

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------
const message = 'disallow literal string';
const errors = [{ message }]; // default errors

var ruleTester = new RuleTester({
  parser: 'babel-eslint',
  parserOptions: {
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  }
});
ruleTester.run('no-literal-string', rule, {
  valid: [
    { code: 'import("hello")' },
    { code: 'import name from "hello";' },
    { code: 'export * from "hello_export_all";' },
    { code: 'export { a } from "hello_export";' },
    { code: 'require("hello");' },
    { code: 'const a = require(["hello"]);' },
    { code: 'const a = require(["hel" + "lo"]);' },
    { code: 'const a = 1;' },
    { code: 'i18n("hello");' },
    { code: 'dispatch("hello");' },
    { code: 'store.dispatch("hello");' },
    { code: 'store.commit("hello");' },
    { code: 'i18n.t("hello");' },
    { code: 'const a = "absfoo";', options: [{ ignore: ['foo'] }] },
    { code: 'const a = "fooabc";', options: [{ ignore: ['^foo'] }] },
    { code: 'const a = "FOO";' },
    { code: 'var A_B = "world";' },
    { code: 'var a = {["A_B"]: "hello world"};' },
    { code: 'var a = {[A_B]: "hello world"};' },
    { code: 'var a = {A_B: "hello world"};' },
    { code: 'var a = {foo: "FOO"};' },
    // JSX
    { code: '<div className="primary"></div>' },
    { code: '<div className={a ? "active": "inactive"}></div>' },
    { code: '<div>{i18next.t("foo")}</div>' }
  ],

  invalid: [
    { code: 'const a = "foo";', errors },
    { code: 'const a = call("Ffo");', errors },
    { code: 'var a = {foo: "bar"};', errors },
    { code: 'const a = "afoo";', options: [{ ignore: ['^foo'] }], errors },
    // JSX
    { code: '<div>foo</div>', errors },
    { code: '<div>FOO</div>', errors }
  ]
});

//
// ─── VUE ────────────────────────────────────────────────────────────────────────
//

const vueTester = new RuleTester({
  parser: 'vue-eslint-parser',
  parserOptions: {
    sourceType: 'module'
  }
});

vueTester.run('no-literal-string', rule, {
  valid: [{ code: '<template>{{ i18next.t("abc") }}</template>' }],
  invalid: [
    {
      code: '<template>abc</template>',
      errors
    },
    {
      code: '<template>{{"hello"}}</template>',
      errors
    }
  ]
});
// ────────────────────────────────────────────────────────────────────────────────

//
// ─── TYPESCRIPT ─────────────────────────────────────────────────────────────────
//

const tsTester = new RuleTester({
  parser: '@typescript-eslint/parser',
  parserOptions: {
    sourceType: 'module',
    project: path.resolve(__dirname, 'tsconfig.json')
  }
});

tsTester.run('no-literal-string', rule, {
  valid: [
    { code: '<div className="hello"></div>', filename: 'a.tsx' },
    { code: "var a: Element['nodeName']" },
    { code: "var a: Omit<T, 'af'>" },
    { code: "type T = {name: 'b'} ; var a: T =  {name: 'b'}" }
  ],
  invalid: [
    {
      code: `<button className={styles.btn}>loading</button>`,
      filename: 'a.tsx',
      errors
    },

    { code: "var a: {type: string} = {type: 'bb'}", errors }
  ]
});
// ────────────────────────────────────────────────────────────────────────────────
