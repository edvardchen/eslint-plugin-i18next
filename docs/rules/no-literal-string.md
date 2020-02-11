# disallow literal string (no-literal-string)

This rule aims to avoid developers to display literal string to users
in those projects which need to support [multi-language](https://www.i18next.com/).

## Rule Details

It will find out all literal strings and validate them.

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

### i18n

This rule allows to call i18next translate function.

**Correct** code:

```js
/*eslint i18next/no-literal-string: "error"*/
var bar = i18next.t('bar');
var bar2 = i18n.t('bar');
```

### Redux/Vuex

This rule also works with those state managers like
[Redux](https://redux.js.org/) and [Vuex](https://vuex.vuejs.org/).

**Correct** code:

```js
/*eslint i18next/no-literal-string: "error"*/
var bar = store.dispatch('bar');
var bar2 = store.commit('bar');
```

## Options

### ignore

The `ignore` option specifies exceptions not to check for
literal strings that match one of regexp paterns.

Examples of correct code for the `{ "ignore": ['foo'] }` option:

```js
/*eslint i18next/no-literal-string: ["error", {"ignore": ["foo"]}]*/
const a = 'afoo';
```

### ignoreCallee

THe `ignoreCallee` option speficies exceptions not check for
function calls whose names match one of regexp patterns.

Examples of correct code for the `{ "ignoreCallee": ["foo"] }` option:

```js
/*eslint i18next/no-literal-string: ["error", { "ignoreCallee": ["foo"] }]*/
const bar = foo('bar');
```

## When Not To Use It

Your project maybe not need to support multi-language or you dont care to spread literal string anywhre.
