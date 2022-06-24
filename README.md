# eslint-plugin-i18next

ESLint plugin for i18n

> For old versions below v6, plz refer [this document](./v5.md)

## Installation

```bash
npm install eslint-plugin-i18next@next --save-dev
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

This rule aims to avoid developers to display literal string directly to users without translating them.

> <span style="color: lightcoral">Note:</span> Disable auto-fix because key in the call `i18next.t(key)` usually was not the same as the literal

Example of incorrect code:

```js
/*eslint i18next/no-literal-string: "error"*/
<div>hello world</div>
```

Example of correct code:

```js
/*eslint i18next/no-literal-string: "error"*/
<div>{i18next.t('HELLO_KEY')}</div>
```

More options can be found [here](./docs/rules/no-literal-string.md)

### Breaking change

By default, it will only validate the plain text in JSX markup instead of all literal strings in previous versions.
[You can change it easily](./docs/rules/no-literal-string.md)
