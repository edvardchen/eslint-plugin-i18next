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

> <span style="color: lightcoral">Note:</span> Disable auto-fix because key in the call `i18next.t(key)` ussally was not the same as the literal

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

#### HTML Markup

All literal strings in html template are typically mistakes. For JSX example:

```HTML
<div>foo</div>
```

They should be translated by [i18next translation api](https://www.i18next.com/):

```HTML
<div>{i18next.t('foo')}</div>
```

Same for [Vue template](https://vuejs.org/v2/guide/syntax.html):

```HTML
<!-- incorrect -->
<template>
  foo
</template>

<!-- correct -->
<template>
  {{ i18next.t('foo') }}
</template>
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

#### Typescript

The following cases are **correct**:

```typescript
// skip TSLiteralType
var a: Type['member'];
var a: Omit<T, 'key'>;

// skip literal with LiteralType
var a: { t: 'button' } = { t: 'button' };
var a: 'abc' | 'name' = 'abc';
```

We require type information to work properly, so you need to add some options in your `.eslintrc`:

```js
  "parserOptions": {
    // path of your tsconfig.json
    "project": "./tsconfig.json"
  }
```

See
[here](https://github.com/typescript-eslint/typescript-eslint/tree/master/packages/eslint-plugin#usage)
for more deteils.

#### Import/Export

The following cases are **correct**:

```typescript
import mod from 'm';
import('mod');
require('mod');

export { named } from 'm';
export * from 'm';
```

#### Comparison

String comparison is fine.

```typescript
// correct
name === 'Android' || name === 'iOS';
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
