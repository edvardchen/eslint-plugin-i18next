# eslint-plugin-i18next

ESLint plugin for i18n

## Installation

```
$ npm install eslint-plugin-i18next --save-dev
```

## Usage

Add `i18next` to the plugins section of your `.eslintrc` configuration file.

```json
{
  "plugins": ["i18next"]
}
```

Then configure the rules you want to use under the rules section.

```json
{
  "rules": {
    "i18next/no-literal-string": 2
  }
}
```

or

```json
{
  "extends": ["plugin:i18next/recommended"]
}
```

## Rule `no-literal-string`

This rule aims to avoid developers to display literal string to users
in those projects which need to support [multi-language](https://www.i18next.com/).

The `--fix` option on the [command line](https://eslint.org/docs/user-guide/command-line-interface#fixing-problems) can automatically fix some of the problems reported by this rule.

Literay strings that are not constant string (all characters are `UPPERCASE`) are typically mistakes. For example:

```js
const foo = 'foo';
```

They are frowned upon in favor of internationalization:

```js
const foo = i18next.t('foo'); // wrapped by i18n translation function
```

### Rule Details

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

#### i18n

This rule allows to call i18next translate function.

**Correct** code:

```js
/*eslint i18next/no-literal-string: "error"*/
var bar = i18next.t('bar');
var bar2 = i18n.t('bar');
```

Maybe you use other internationalization libraries
not [i18next](https://www.i18next.com/). You can use like this:

```js
/*eslint i18next/no-literal-string: ["error", { "ignoreCallee": ["yourI18n"] }]*/
const bar = yourI18n('bar');

// or

/*eslint i18next/no-literal-string: ["error", { "ignoreCallee": ["yourI18n.method"] }]*/
const bar = yourI18n.method('bar');
```

#### Redux/Vuex

This rule also works with those state managers like
[Redux](https://redux.js.org/) and [Vuex](https://vuex.vuejs.org/).

**Correct** code:

```js
/*eslint i18next/no-literal-string: "error"*/
var bar = store.dispatch('bar');
var bar2 = store.commit('bar');
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

Examples of correct code for the `{ "ignoreCallee": ["foo"] }` option:

```js
/*eslint i18next/no-literal-string: ["error", { "ignoreCallee": ["foo"] }]*/
const bar = foo('bar');
```
