# disallow literal string (no-literal-string)

Please describe the origin of the rule here.

## Rule Details

This rule aims to...

Examples of **incorrect** code for this rule:

```js
/*eslint i18next/no-literal-string: "error"*/
const a = 'foo';
```

Examples of **correct** code for this rule:

```js
/*eslint i18next/no-literal-string: "error"*/
// safe to assign string to const variables whose name are UPPER_CASE
var FOO = 'foo';

// UPPER_CASE properties are valid no matter if they are computed or not
var a = {
  BAR: 'bar',
  [FOO]: 'foo'
};

// also safe to use strings themselves are UPPCASE_CASE
var foo = 'FOO';
```

### Options

#### ignore

The `ignore` option specifies exceptions not to check for
literal strings that match one of regexp paterns.

Examples of correct code for the `{ "ignore": ['foo'] }` option:

```js
/*eslint i18next/no-literal-string: ["error", {"ignore": ["foo"]}]*/
const a = 'afoo';
```

#### ignoreCallee

THe `ignoreCallee` option speficies exceptions not check for
function calls whose names match one of regexp patterns.

Examples of correct code for the `{ "ignoreCallee": ['i18n.t', 'i18n'] }` option:

```js
/*eslint i18next/no-literal-string: ["error", { "ignoreCallee": ['i18n.t', 'i18n'] }]*/
const foo = i18n('foo');

const bar = i18n.t('bar');
```

## When Not To Use It

Your project maybe not need to support multi-language or you dont care to spread literal string anywhre.
