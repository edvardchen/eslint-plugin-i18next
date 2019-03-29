/**
 * @fileoverview disallow literal string
 * @author edvardchen
 */
'use strict';

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var rule = require('../../../lib/rules/no-literal-string'),
  RuleTester = require('eslint').RuleTester;

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------
const message = 'disallow literal string';
const errors = [{ message }]; // default errors

var ruleTester = new RuleTester({
  parser: 'babel-eslint',
  parserOptions: {
    sourceType: 'module'
  }
});
ruleTester.run('no-literal-string', rule, {
  valid: [
    { code: 'import name from "hello";' },
    { code: 'require("hello");' },
    { code: 'const a = require(["hello"]);' },
    { code: 'const a = require(["hel" + "lo"]);' },
    { code: 'i18n("hello");', options: [{ ignoreCallee: ['i18n'] }] },
    { code: 'i18n.t("hello");', options: [{ ignoreCallee: ['i18n.t'] }] },
    { code: 'const a = "absfoo";', options: [{ ignore: ['foo'] }] },
    { code: 'const a = "fooabc";', options: [{ ignore: ['^foo'] }] },
    { code: 'const a = "FOO";' },
    { code: 'var A_B = "world";' },
    { code: 'var a = {[A_B]: "hello world"};' },
    { code: 'var a = {A_B: "hello world"};' }
  ],

  invalid: [
    { code: 'const a = "foo";', errors },
    { code: 'const a = call("Ffo");', errors },
    { code: 'const a = "afoo";', options: [{ ignore: ['^foo'] }], errors }
  ]
});
